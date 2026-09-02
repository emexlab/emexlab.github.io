#!/bin/sh

set -e

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

openssh_opts='-o BatchMode=true '

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
                openssh_opts="-o BatchMode=false "
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
    ssh $openssh_opts"$1" /bin/sh <<'EOF'
    set -e
    rm -rf "$HOME/emexlabs"
EOF

    scp -rC $openssh_opts./build "$1:~/emexlabs"
    
    ssh $openssh_opts"$1" /bin/sh <<'EOF'
    set -e
    find "$HOME/emexlabs" -type d -exec chmod 755 {} +
    find "$HOME/emexlabs" -type f -exec chmod 644 {} +
EOF
fi

ssh $openssh_opts"$1" /bin/sh -c "$(cat <<'EOF'
# Bootstrap comparison
diff -qr "$HOME/emexlabs/bootstrap" "/var/www/emexlabs/bootstrap" >/dev/null 2>&1
bootstrap_diff=$?
set -e
if [ "$bootstrap_diff" -ne 0 ]; then
    if [ "$bootstrap_diff" -eq 1 ]; then
        printf 'Bootstrap is different! Replace it? [y/N] '
    else
        printf 'Bootstrap check failed! Continue anyway? [y/N] '
    fi
    if [ ! -t 0 ]; then
        error "No stdin. Exiting." 2
    fi
    read -r response
    case "$response" in
        [yY][eE][sS]|[yY]) ;;
        *) printf "Cancelling deployment.\n"; exit 1 ;;
    esac
fi

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
)"
