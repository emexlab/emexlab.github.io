#!/bin/sh

set -e

# Contains a list of paths that will not be changed on the deployment server
excluded_paths="/apt:/bootstrap"

usage() {
    cat <<EOF
Usage: $0 ssh-server [options]

Options:
    -b, --skip-build    Skip building. Use last local build
    -u, --skip-upload   Skip building and uploading. Use unfinished server-side deployment
    -n, --no-batchmode  Disable batchmode for ssh
    -h, --help          Show this help message
EOF
}

error() {
    echo "Error: $1" >&2
    [ -n "$3" ] && echo && usage
    exit "${2:-1}"
}

openssh_opts='-t '

while [ "${1#-}" != "$1" ]; do
    for opt in $([ "${1#--}" = "$1" ] && echo "${1#-}" | grep -o . || echo "$1"); do
        case "$opt" in
            '--')
                shift
                break 2
                ;;
            'b' | '--skip-build' | 's')
                skip_build=1
                ;;
            'u' | '--skip-upload')
                skip_build=1
                skip_upload=1
                ;;
            'n' | '--no-batchmode')
                no_batchmode=1
                ;;
            'h' | '--help')
                usage
                exit 0
                ;;
            '-')
                error "Invalid options" 1 usage
                ;;
            --*)
                error "Unknown option: $opt" 1 usage
                ;;
            *)
                error "Unknown option: -$opt" 1 usage
                ;;
        esac
    done
    shift
    unset opt
done

[ -z "$no_batchmode" ] && openssh_opts='-o BatchMode=true '

case "$1" in
    *@*) ;;
    *)
        error "Please specify a valid ssh connection! (user@host)" 1 usage
        ;;
esac

cd "$(dirname "$0")"

if [ "$skip_build" != "1" ]; then
    npm run build
    printf '\n'
fi

if [ "$skip_upload" != "1" ]; then
    ssh "$openssh_opts" "$1" /bin/sh <<'EOF'
    set -e
    rm -rf "$HOME/emexlabs"
EOF

    scp -rC "$openssh_opts" ./build "$1:~/emexlabs"
    
    # Prepair deployment (fixup and etc.)
    ssh "$openssh_opts" "$1" /bin/sh <<EOF
    set -e

    find "\$HOME/emexlabs" -type d -exec chmod 755 {} +
    find "\$HOME/emexlabs" -type f -exec chmod 644 {} +

    excluded_paths='$excluded_paths'

    IFS=:
    for exclude in \$excluded_paths; do
        [ -e "/var/www/emexlabs\$exclude" ] || continue
        rm -rf \$HOME/emexlabs\$exclude
        cp -a /var/www/emexlabs\$exclude \$HOME/emexlabs\$exclude
    done
EOF
fi

ssh "$openssh_opts" "$1" /bin/sh <<'EOF'
set -e

# Deployment
trap '
status=$?
printf "\n\033[31;1mDeployment failed!\nMaybe your servers mv command does not support --exchange?\033[0m\n" >&2
exit $status
' 0
mv --exchange -T "$HOME/emexlabs" "/var/www/emexlabs"
trap '
status=$?
printf "\n\033[31;1mBackup failed!\033[0m\n" >&2
exit $status
' 0
printf '\n\033[32;1mDeployed successfully!\033[0m\n\nBacking up old site...\n'

# Backup creation
mkdir -p "$HOME/backups"
backup_timestamp=$(date +%Y%m%d_%H%M%S)
backup_path="backups/website-${backup_timestamp}"
i=0
while [ -e "$HOME/$backup_path" ]; do
    i=$((i + 1))
    backup_path="backups/website-${backup_timestamp}-$i"
done
mv "$HOME/emexlabs" "$HOME/$backup_path"
trap - 0
printf '\n\033[33;1mBackup successful!\033[0m\n'
EOF
