import Link from 'next/link'

export default function Footer(){
    return(
            <footer>
                <div className="footer-separator separator-1"></div>
                <div className="footer-separator separator-2"></div>
                <div className="footer-wrapper">
                    <div className="footer-nav">
                        <div className="footer-nav-menu">
                            <Link className="footer-text" href="/"><i className="symbol fill-white">home</i></Link> 
                            <Link className="footer-text" href="/compare">Compare</Link>
                            <Link className="footer-text" href="/locate">Locate</Link>
                        </div>
                            <a href="https://www.pitti.io" rel="author" target="_blank">
                                <div className='svg-logo'>
                                    <svg  viewBox="0 0 64 30" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M8.73315363881402 0.001 L17.2641509433962 9.29919137466307 L24.5013477088949 26.4420485175202 L16.900269541779 29.5148247978437 L0.001 24.6630727762803 Z" fill="white"/>
                                        <path d="M20.5390835579515 8.61185983827493 L45.0808625336927 0.363881401617251 L43.2614555256065 12.6549865229111 L34.0835579514825 29.1509433962264 L27.2911051212938 24.8652291105121 Z" fill="white"/>
                                        <path d="M43.9083557951482 18.3962264150943 L58.2210242587601 6.06469002695418 L63.0727762803235 12.4528301886792 L63.7196765498652 29.99999 L37.9649595687332 29.2722371967655 Z" fill="white"/>
                                    </svg>
                                </div>
                            </a>
                            <div className="footer-text">© 2023 PITTI</div>
                    </div>
                    <div className="footer-nav footer-logo">
                        <div className="social-logo twitter">
                            <a href="https://twitter.com/sorarepitti" rel="noreferrer" target="_blank">@SorarePITTI</a>
                        </div>
                        <div className="social-logo twitter">
                            <a href="https://twitter.com/PITTI_DATA" rel="noreferrer" target="_blank">@PITTI_DATA</a>
                        </div>
                        <div className="social-logo github">
                            <a href="https://github.com/pappitti/offthecharts" rel="noreferrer" target="_blank">pappitti/offthecharts</a>
                        </div>
                    </div>
                </div>
            </footer>
    )
  }
  ;
