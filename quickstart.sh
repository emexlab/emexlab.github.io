#!/bin/sh

error() {
    echo "Error: $1" >&2
    exit "${2:-1}"
}

cd "$(dirname "$0")" || error "Failed to change directory" $?
chmod +x ./deploy.sh

if ! command -v node >/dev/null; then
    if command -v sudo >/dev/null; then
        sudo bash <<'EOF' || error "Failed to install nodejs, please install it manually"
            apt-get install nodejs npm -y ||
            dnf install nodejs npm -y ||
            pacman -S nodejs npm --noconfirm ||
            apk add nodejs npm ||
            zypper install -y nodejs npm ||
            yum install nodejs npm -y ||
            xbps-install -Sy nodejs ||
            emerge --ask=n net-libs/nodejs ||
            eopkg install -y nodejs
EOF
    else
        bash <<'EOF' || error "Failed to install nodejs, please install it manually"
            apt-get install nodejs npm -y ||
            dnf install nodejs npm -y ||
            pacman -S nodejs npm --noconfirm ||
            apk add nodejs npm ||
            zypper install -y nodejs npm ||
            yum install nodejs npm -y ||
            xbps-install -Sy nodejs ||
            emerge --ask=n net-libs/nodejs ||
            eopkg install -y nodejs
EOF
    fi
fi

if ! npm list >/dev/null 2>&1; then
    npm install || error "npm failed to install required packages" $?
else
    echo "All packages already installed"
fi

printf "\n\033[32;1mYou are now setup!\033[0m\n"
echo "For further guidance check README.md"
