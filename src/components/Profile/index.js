import styles from './styles.module.css';

export default function Profile({ name, role, github, img }) {
    const image = img || `https://github.com/${github.split('/')[0]}.png`
    return (
        <a className={styles.profile} href={`https://github.com/${github}`} target='_blank' rel='noopener noreferrer'>
            <img alt={name} src={image} />
            <div>
                <span>{name}</span>
                {role != null && <small title={role}>{role}</small>}
            </div>
        </a>
    );
}
