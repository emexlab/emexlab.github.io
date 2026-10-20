#!/bin/sh

set -e

# Contains a list of paths that will not be changed on the deployment server
excluded_paths="/apt:/bootstrap:/community"

usage() {
    cat <<EOF
Usage: $0 [options] user@host

Options:
    -b, --skip-build        Skip building. Use last local build.
    -u, --skip-upload       Skip building and uploading. Use unfinished server-side deployment.
    -n, --no-batchmode      Disable batchmode for ssh.
    -k, --keep-old-backups  Don't perform old backup cleanup.
    -h, --help              Show this help message.
EOF
}

error() {
    echo "Error: $1" >&2
    [ -n "$3" ] && echo && usage
    exit "${2:-1}"
}

openssh_opts='-o BatchMode=true'

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
                openssh_opts=''
                ;;
            'k' | '--keep-old-backups')
                keep_old_backups=1
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
    ssh $openssh_opts "$1" /bin/sh <<'EOF'
    set -e
    rm -rf "$HOME/emexlabs"
EOF

    scp -rC $openssh_opts ./build "$1:~/emexlabs"
    
    # Prepair deployment (fixup and etc.)
    ssh $openssh_opts "$1" /bin/sh -s -- "$excluded_paths" <<'EOF'
    set -e

    find "$HOME/emexlabs" -type d -exec chmod 755 {} +
    find "$HOME/emexlabs" -type f -exec chmod 644 {} +

    excluded_paths="$1"

    IFS=:
    for exclude in $excluded_paths; do
        [ -n "$exclude" ] || continue
        [ -e "/var/www/emexlabs$exclude" ] || continue

        rm -rf $HOME/emexlabs$exclude
        cp -a /var/www/emexlabs$exclude $HOME/emexlabs$exclude
    done
EOF
fi

ssh $openssh_opts "$1" /bin/sh -s -- "$keep_old_backups" <<'EOF'
set -e

# Deployment
trap '
    status=$?
    printf "\033[0;31;1mDeployment failed!\033[0m\nMaybe your servers mv command does not support --exchange?\n" >&2
    exit $status
' 0

printf '\n\033[0;36;1mDeploying...\033[0m\n'
mv --exchange -T "$HOME/emexlabs" "/var/www/emexlabs"
printf '\033[0;32;1mDeployed successfully!\033[0m\n'


# Backup creation
trap '
    status=$?
    printf "\033[0;31;1mBackup failed!\033[0m\nPlease do the backup manually\n" >&2
    exit $status
' 0

printf '\n\033[0;33;1mBacking up old website...\033[0m\n'
mkdir -p "$HOME/backups"
backup_timestamp=$(date +%Y%m%d_%H%M%S)

backup_path="backups/website-${backup_timestamp}"
i=0
while [ -e "$HOME/$backup_path" ]; do
    i=$((i + 1))
    backup_path="backups/website-${backup_timestamp}-$i"
done

mv "$HOME/emexlabs" "$HOME/$backup_path"
printf '\033[0;32;1mBackup successful!\033[0m\n'


# Backup Cleanup
if [ "$1" != "1" ]; then
    trap '
        printf "\033[0;31;1mBackup cleanup failed!\033[0m\nThis is non-critical\n" >&2
        exit 0
    ' 0

    printf '\n\033[0;34;1mClearing out old backups...\033[0m\n'
    cutoff=$(date -v-30d +%Y%m%d 2>/dev/null) ||   # macOS/BSD
    cutoff=$(date -d '30 days ago' +%Y%m%d 2>/dev/null) ||   # GNU/Linux
    cutoff=$(date -d "@$(( $(date +%s) - 30*86400 ))" +%Y%m%d)   # BusyBox fallback

    case $cutoff in
        [0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]) ;;
        *) echo "Could not compute cutoff date" >&2; exit 0 ;;
    esac

    for dir in "$HOME"/backups/website-*; do
        [ -d "$dir" ] || continue
        name=${dir##*/}
        stamp=${name#website-}
        day=${stamp%%_*}

        case $day in
            [0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]) ;;
            *) continue ;;
        esac

        if [ "$day" -lt "$cutoff" ]; then
            echo "Deleting $dir"
            rm -rf -- "$dir"
        fi
    done
fi

trap - 0
EOF
