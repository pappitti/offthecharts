import Image from 'next/image'
import styles from './page.module.css'

import { Roboto_Flex} from 'next/font/google';

const roboto = Roboto_Flex({
  subsets: ['latin'], 
  display: "swap",
  weight: ['400', '800'],
}); 

//landing page
export default function Home() {
  return (
    <main >
      <div className="intro">
          <div className="intro-content">
              <div className={`main-title`}>off_the_charts</div> 
              <div className='start-button-container'>
                  <div className='navigation-tile'>
                    <div className={`main-subtitle`}>Visualizing athletes&apos; performance using <br/>complex fantasy sports matrices </div>
                    <div className='navigation-block'>
                      <div className='know-more'><a href="https://www.pitti.io/articles/not-all-sports-statistics-are-equal" target="_blank" rel="author">About</a> the radar</div>
                      <div className='start-button'><a href="/compare">COMPARE</a></div>
                    </div>
                  </div>
                  <div className='navigation-tile'>
                    <div className='main-subtitle'>Find out if you are truly playing <br/>the global game</div>
                    <div className='navigation-block'>
                      <div className='know-more'><a href="https://www.pitti.io/projects/off-the-charts" target="_blank" rel="author">About</a> the map</div>
                      <div className='start-button'><a href="/locate">LOCATE</a></div>
                    </div>
                  </div>
              </div>
              <div className='know-more-content'>
                  <div className='know-more'><a href="https://www.pitti.io/projects/off-the-charts" target="_blank" rel="author">About</a> the off_the_charts project</div>
                  <div className='svg-logo'>
                  <svg  viewBox="0 0 64 30" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8.73315363881402 0.001 L17.2641509433962 9.29919137466307 L24.5013477088949 26.4420485175202 L16.900269541779 29.5148247978437 L0.001 24.6630727762803 Z" fill="var(--light-orange)"/>
                      <path d="M20.5390835579515 8.61185983827493 L45.0808625336927 0.363881401617251 L43.2614555256065 12.6549865229111 L34.0835579514825 29.1509433962264 L27.2911051212938 24.8652291105121 Z" fill="var(--light-orange)"/>
                      <path d="M43.9083557951482 18.3962264150943 L58.2210242587601 6.06469002695418 L63.0727762803235 12.4528301886792 L63.7196765498652 29.99999 L37.9649595687332 29.2722371967655 Z" fill="var(--light-orange)"/>
                  </svg>
                  </div>
              </div>
          </div>
      </div>
    </main>
  )
}
