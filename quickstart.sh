#!/bin/sh

error() {
    echo "Error: $1" >&2
    exit "${2:-1}"
}

install() {
    if ! command -v "$2" >/dev/null; then
        if command -v sudo >/dev/null; then
            sudo bash <<"EOF" || error "Failed to install $1, please install it manually"
                apt-get install "$1" npm -y ||
                dnf install "$1" npm -y ||
                pacman -S "$1" npm --noconfirm ||
                apk add "$1" npm ||
                zypper install -y "$1" npm ||
                yum install "$1" npm -y ||
                xbps-install -Sy "$1" ||
                eopkg install -y "$1"
EOF
        else
            bash <<"EOF" || error "Failed to install $1, please install it manually"
                apt-get install "$1" npm -y ||
                dnf install "$1" npm -y ||
                pacman -S "$1" npm --noconfirm ||
                apk add "$1" npm ||
                zypper install -y "$1" npm ||
                yum install "$1" npm -y ||
                xbps-install -Sy "$1" ||
                eopkg install -y "$1"
EOF
        fi
    fi
}

cd "$(dirname "$0")" || error "Failed to change directory" $?
chmod +x ./deploy.sh

install nodejs node
install grep grep

if ! npm list >/dev/null 2>&1; then
    npm install || error "npm failed to install required packages" $?
else
    echo "All packages already installed"
fi

printf "\n\033[32;1mYou are now setup!\033[0m\n"
echo "For further guidance check README.md"
