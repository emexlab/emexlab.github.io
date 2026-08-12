import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Layout from '@theme/Layout';
import ThemedImage from '@theme/ThemedImage';
import Heading from '@theme/Heading';
import styles from './index.module.css';
import ImagePopup from '@site/src/components/ImagePopup';
import AdditionalText from './_additionalText.mdx';

export default function Home() {
  return (
    <Layout
      title="Nyxian"
      description="IDE to develop native code iOS apps and tools on unjailbroken iOS">
      <header className={clsx('hero--primary', styles.heroBanner)}>
        <div className="container">
          <ThemedImage
            alt="Logo"
            sources={{
              light: useBaseUrl('/Nyxian/img/icon/light.png'),
              dark: useBaseUrl('/Nyxian/img/icon/dark.png'),
            }}
            className={styles.logo}
          />
          <Heading as="h1" className="hero__title">
            Nyxian
          </Heading>
          <p className="hero__subtitle">
            IDE to develop native code iOS apps and tools on unjailbroken iOS
          </p>
          <div className={styles.buttons}>
            <Link
              className="button button--secondary button--lg"
              to="/Nyxian/docs/installation">
              Get Started
            </Link>
          </div>
        </div>
      </header>
      <main className={clsx('cdenter', styles.main)}>
        <Heading as="h1">Introduction</Heading>
        <aside className={styles.showcase}>
          <ImagePopup src={useBaseUrl('/Nyxian/img/mockup.png')} alt="Mockup" />
        </aside>
        <AdditionalText />
      </main>
    </Layout>
  );
}
