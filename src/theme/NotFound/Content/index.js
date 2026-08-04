import React from 'react';
import clsx from 'clsx';
import Translate from '@docusaurus/Translate';
import Heading from '@theme/Heading';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import ThemedImage from '@theme/ThemedImage';
export default function NotFoundContent({className}) {
  return (
    <main className={clsx('container margin-vert--xl', className)}>
      <div className="row">
        <div className="col col--6 col--offset-3" align="center">
          <Heading as="h1" className="hero__title"  align="center">
            <ThemedImage
              alt="404"
              sources={{
                light: useBaseUrl('/404/light.png'),
                dark: useBaseUrl('/404/dark.png'),
              }}
            />
            <br />
            <Translate
              id="theme.NotFound.title"
              description="The title of the 404 page">
              Page Not Found
            </Translate>
          </Heading>
          <p>
            <Translate
              id="theme.NotFound.p1"
              description="The first paragraph of the 404 page">
              We could not find what you were looking for.
            </Translate>
          </p>
          <p>
            <i>"You shouldn't be here"</i>
            <br />
            <Translate
              id="theme.NotFound.p2"
              description="The 2nd paragraph of the 404 page"
              values={{
                github: (
                  <Link
                    to="https://github.com/emexlab/emexlab.github.io"
                    style={{
                      textDecoration: 'underline'
                    }}
                  >
                    Github
                  </Link>
                )
              }}
            >
              {'If you got here from a link on the website please report it at our {github}.'}
            </Translate>
          </p>
        </div>
      </div>
    </main>
  );
}
