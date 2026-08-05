import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Layout from '@theme/Layout';
import ThemedImage from '@theme/ThemedImage';
import Heading from '@theme/Heading';
import Admonition from '@theme/Admonition';
import styles from './index.module.css';
import ImagePopup from '@site/src/components/ImagePopup';
import AdditionalText from './_additionalText.mdx';

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
              to="/emexDE/docs/installation">
              Get Started
            </Link>
          </div>
        </div>
      </header>
      <main className={clsx('center', styles.main)}>
        <Heading as="h1">Introduction</Heading>
        <div className={clsx('sections', styles.divided)}>
          <ImagePopup src={useBaseUrl('/emexDE/img/mockup.png')} alt="Mockup" className={styles.showcase} />
          <div>
              <Heading as="h2">What is it?</Heading>
              <p>
                emexDE is an iOS app that empowers developers with a full toolchain they can use while even being offline for iOS development on iPhone. It supports Swift, C, Objective-C, C++ and Objective-C++. It’s a powerful Xcode alternative that made the impossible possible, a fully on-device iOS IDE that doesn’t even need a cloud and can even be used with airplane mode enabled. It supports officially iOS 16 all the way up to the latest iOS version. You can compile and run iOS apps on the go with ease, using the entire iOS 26.4 SDK.
              </p>
          </div>
        </div>
        <Admonition type="info">
          Remember emexDE is still in beta, so some issue might arise! Please report issues over at the [Github](https://github.com/emexlab/emexDE/issues/new/choose).
        </Admonition>
        <AdditionalText />
      </main>
    </Layout>
  );
}
