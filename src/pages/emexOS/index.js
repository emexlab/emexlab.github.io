import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';

export default function Home() {
  return (
    <Layout
      title="emexOS"
      description="Graphical OS written from scratch in C. It gives you full control over your system">
      <main>
          <div>
            {/*<link rel="stylesheet" href="css/style.css" />
            <link
              href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css"
              rel="stylesheet"
              />
            <link
              href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500&display=swap"
              rel="stylesheet"
              />
            <link
              href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
              rel="stylesheet"
              />
            <link
              href="https://fonts.googleapis.com/css2?family=Newsreader:wght@400;500;600;700&display=swap"
              rel="stylesheet"
              />
            <script defer src="backend/info.js"></script>
            <script defer src="backend/toggle.js"></script>
            <script defer src="backend/cursor.js"></script>
            <script defer src="backend/icons-theme.js"></script>*/}
            <div
              className="parallaxTop"
              style={{backgroundImage: 'url(images/homeScreenBlurred.jpg)'}}
              >
              {/*<div className="title">
                  <p className="subtitle-main">
                      -== minimalistic x86-64 OS built from the ground up ==-
                  </p>
                  </div>*/}
              <div className="theme-toggle-wrapper">
                  <button id="themeToggle" className="theme-toggle">
                  <span className="theme-icon">
                  <img src="../gen/icons/light/moon.svg" alt=" " />
                  </span>
                  </button>
              </div>
              <div className="div1">
                  <div className="firstwrapper">
                    <div className="first-image">
                        <img id="logo" src="images/logo.png" alt="emexOS Logo" />
                    </div>
                    <div className="top-section">
                        <h1 className="intro-title">emexOS</h1>
                        <p className="intro-text">
                          <a href="https://github.com/emexos/emexOS1">emexOS</a>
                          is a graphical, from scratch operating system written
                          entirely in
                          <a
                              href="https://en.wikipedia.org/wiki/C_(programming_language)"
                              >C</a
                              >
                          by <a href="https://github.com/Voxi0">Voxi0</a>,
                          <a href="https://github.com/tsaraki">tsaraki</a>,
                          <a href="https://github.com/emexos">emex</a>.
                          <a href="https://github.com/BloopBiMoz">Bi Moz</a>, and
                          <a href="https://github.com/Novice06/">Novice</a> it's
                          designed for developers and customization enthusiasts,
                          who want full control over their systems.
                        </p>
                        <p className="text2"></p>
                        <div className="firsthighlight">
                          <p className="intro-text" style={{marginBottom: 0}}>
                              <strong>Info:</strong> emexOS is still under hard
                              developement and IS NOT daily-drivable yet.
                          </p>
                        </div>
                        <div style={{marginTop: '20px'}}>
                          <a
                              href="https://github.com/emexos/emexOS1"
                              target="_blank"
                              className="button downloadButton github-link"
                              style={{
                                width: 'auto',
                                minWidth: '160px',
                                display: 'inline-flex'
                              }}
                              >
                          <img
                              className="theme-icon-dynamic"
                              data-icon="github"
                              src="../gen/icons/light/github.svg"
                              alt=""
                              style={{
                                width: '20px',
                                height: '20px',
                                marginRight: '8px',
                              }}
                              />
                          View on GitHub
                          </a>
                          <a
                              href="contact.html"
                              className="button downloadButton"
                              style={{
                                width: 'auto',
                                minWidth: '160px',
                                display: 'inline-flex',
                                marginLeft: '8px'
                              }}
                              >
                          <img
                              className="theme-icon-dynamic"
                              data-icon="mail"
                              src="../gen/icons/light/mail.svg"
                              alt=""
                              style={{
                                width: '20px',
                                height: '20px',
                                marginRight: '8px'
                              }}
                              />
                          Contact Us
                          </a>
                        </div>
                    </div>
                  </div>
                  <div className="about2">
                    <div className="aboutSubtitle" style={{textAlign: 'left'}}>
                        &gt; MAIN FEATURES
                    </div>
                    <div className="secondgrid">
                        <div className="secondcards">
                          <div className="second-title">Made from scratch</div>
                          <div className="second-description">
                              Entirely written from scratch (except the
                              bootloader...)
                          </div>
                        </div>
                        <div className="secondcards">
                          <div className="second-title">Limine Bootloader</div>
                          <div className="second-description">
                              Limine is a advanced bootloader, excellent for
                              x86-64 architectures
                          </div>
                        </div>
                        <div className="secondcards">
                          <div className="second-title">architecture</div>
                          <div className="second-description">
                              currently emexOS only supports x86-64 chips (like
                              intel & amd)
                          </div>
                        </div>
                        <div className="secondcards">
                          <div className="second-title">drivers</div>
                          <div className="second-description">
                              currently there arent much drivers but the most
                              useful one is the ATA driver, i hope i can implement
                              AHCI soon!
                          </div>
                        </div>
                        <div className="secondcards">
                          <div className="second-title">console</div>
                          <div className="second-description">
                              a small userspace shell which can execute every
                              binutil from the /bin folder.
                          </div>
                        </div>
                        <div className="secondcards">
                          <div className="second-title">customization</div>
                          <div className="second-description">
                              emexOS is already very customizable.
                          </div>
                        </div>
                    </div>
                  </div>
                  {/*<div className="intro-section"></div>*/}
                  <div className="about1" style={{textAlign: 'left'}}>
                    <div className="aboutSubtitle lineunder">&gt; DOWNLOAD EMEXOS</div>
                    <p
                        style={{
                          marginBottom: '30px',
                          fontSize: '18px',
                          color: 'var(--color-text-muted)'
                        }}
                        >
                        select your preferred version, if you're not sure which
                        version to choose, choose the first one.
                    </p>
                    <div className="downloadTableWrap">
                        <table className="downloadTable">
                          <thead>
                              <tr>
                                <th>Version</th>
                                <th></th>
                                <th style={{textAlign: 'right'}}>Download</th>
                              </tr>
                          </thead>
                          <tbody id="releaseTable">
                              <tr>
                                <td
                                    colSpan="3"
                                    style={{padding: '10px', textAlign: 'center'}}
                                    >
                                    Loading releases...
                                </td>
                              </tr>
                          </tbody>
                        </table>
                    </div>
                  </div>
                  {/* Stats Section */}
                  <div className="stats-section">
                    <div className="stat-item">
                        <span className="stat-number">from scratch</span>
                        <span className="stat-label">(no linux)</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-number">x86-64</span>
                        <span className="stat-label">(Intel)</span>
                    </div>
                    {/*<div className="stat-item">
                        <span className="stat-number">25+</span>
                        <span className="stat-label">console commands</span>
                        </div>*/}
                    <div className="about2">
                        <h1 className="intro-text">Run emexOS on real Hardware:</h1>
                        <div style={{maxWidth: '800px', margin: '0 auto'}}>
                          <p className="intro-text">- Download the iso file</p>
                          <p className="intro-text">
                              - format a USB with FAT32, use MBR
                          </p>
                          <p className="intro-text">
                              - flash the iso to the USB (use rufus, balena etcher
                              or `dd`
                          </p>
                          <p className="intro-text">- boot the OS from the USB</p>
                          <p
                              className="intro-text"
                              style={{
                                marginTop: '30px',
                                padding: '20px',
                                backgroundColor: 'var(--color-bg-highlight)',
                                borderLeft: '4px solid var(--color-border-strong)'
                              }}
                              >
                              <strong>requirements:</strong> a x86-64 compatible
                              CPU (Intel), at least 512MB RAM (the more the
                              better), and about 1 GB disk storage is recommended
                          </p>
                        </div>
                    </div>
                  </div>
                  {/*<div className="borderthing"></div>*/}
              </div>
              <div className="footer">
                  <p></p>
              </div>
            </div>
            </div>
      </main>
    </Layout>
  );
}
