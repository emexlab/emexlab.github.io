import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Layout from '@theme/Layout';
import ThemedImage from '@theme/ThemedImage';
import Heading from '@theme/Heading';
import styles from './index.module.css';
import ImagePopup from '@site/src/components/ImagePopup';

export default function Home() {
  return (
    <Layout
      title="emexDE"
      description="IDE to develop native code iOS apps and tools on unjailbroken iOS">
      <header className={clsx('hero--primary', styles.heroBanner)}>
        <div className="container">
          <ThemedImage
            alt="Logo"
            sources={{
              light: useBaseUrl('/emexDE/img/icon/light.png'),
              dark: useBaseUrl('/emexDE/img/icon/dark.png'),
            }}
            className={styles.logo}
          />
          <Heading as="h1" className="hero__title">
            emexDE
          </Heading>
          <p className="hero__subtitle">
            IDE to develop native code iOS apps and tools on unjailbroken iOS
          </p>
          <div className={styles.buttons}>
            <Link
              className="button button--secondary button--lg"
              to="/emexDE/docs">
              Get Started
            </Link>
          </div>
        </div>
      </header>
      <main className="center">
        <div className={clsx('sections', styles.divided)}>
          <div className="center">
            <ImagePopup src={useBaseUrl('/emexDE/img/mockup.png')} alt="Mockup" className={styles.showcase} />
          </div>
          <p>s</p>
        </div>
      </main>
    </Layout>
  );
}