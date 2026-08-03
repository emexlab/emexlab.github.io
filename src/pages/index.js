import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { useEffect } from 'react';
import Layout from '@theme/Layout';
import ThemedImage from '@theme/ThemedImage';
import Heading from '@theme/Heading';
import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero--primary', styles.heroBanner)}>
      <div className="container">
        <img alt={siteConfig.title + " logo"} src={useBaseUrl('/org.png')} className={styles.logo} />
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
      </div>
    </header>
  );
}


export default function Home() {
  useEffect(() => {
    // Little easter egg
    console.log("⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿\n⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿\n⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿\n⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠋⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⣿⣿⣿⣿⣿⣿\n⣿⣿⣿⣿⣿⣿⣿⣿⡿⠋⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⣿⣿⣿⣿⣿⣿\n⣿⣿⣿⣿⣿⣿⡿⠋⠄⠄⠄⠄⢀⣴⣿⣿⣿⣿⣿⠟⠁⠄⠄⠄⢀⣴⣿⣿⣿⣿⣿⣿\n⣿⣿⣿⣿⡿⠋⠄⠄⠄⠄⢀⣴⣿⣿⣿⣿⣿⠟⠁⠄⠄⠄⢀⣴⣿⣿⣿⣿⣿⣿⣿⣿\n⣿⣿⡿⠋⠄⠄⠄⠄⢀⣴⣿⣿⣿⣿⣿⠟⠁⠄⠄⠄⢀⣴⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿\n⣿⣿⣷⣄⠄⠄⠄⠄⠈⠻⣿⣿⣿⣟⠁⠄⠄⠄⢀⣴⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿\n⣿⣿⣿⣿⣷⣄⠄⠄⠄⠄⠈⠻⣿⣿⣷⣄⢀⣴⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿\n⣿⣿⣿⣿⣿⣿⣷⣄⠄⠄⠄⠄⠈⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿\n⣿⣿⣿⣿⣿⣿⣿⣿⣷⣄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⢸⣿⣿⣿⣿⣿\n⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⢸⣿⣿⣿⣿⣿\n⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿\n⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿\n⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿\n");
  });
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title}`}
      description={siteConfig.tagline}>
      <HomepageHeader />
      <main className={styles.center}>
        <div className="sections">
          <div className={styles.project}>
            <img alt="emexOS logo" src={useBaseUrl('/emexOS/img/logo.png')} className={clsx(styles.circle, styles.logo)} />
            <Heading as="h2" className="hero__title">
              emexOS
            </Heading>
            <p className="hero__subtitle">
              Graphical OS written from scratch in C. It gives you full control over your system
            </p>
            <Link
              className="button button--secondary button--lg"
              to="/emexOS/docs"> {/* Revert this to "/emexOS" */}
              View
            </Link>
          </div>
          <div className={styles.project}>
            <ThemedImage
              alt="emexDE logo"
              sources={{
                light: useBaseUrl('/emexDE/img/icon/light.png'),
                dark: useBaseUrl('/emexDE/img/icon/dark.png'),
              }}
              className={styles.logo}
            />
            <Heading as="h2" className="hero__title">
              emexDE
            </Heading>
            <p className="hero__subtitle">
              IDE to develop native code iOS apps and tools on unjailbroken iOS
            </p>
            <Link
              className="button button--secondary button--lg"
              to="/emexDE">
              View
            </Link>
          </div>
        </div>
      </main>
    </Layout>
  );
}
