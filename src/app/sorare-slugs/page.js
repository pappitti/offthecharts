export default function Page() {
    return (
      <div className="page-container">
        <h2>What is the Sorare slug?</h2>
        <p className="page-paragraph">The slug is a unique string to identify a player in the Sorare database. It is typically used to access players information via the Sorare API.</p>
        <p className="page-paragraph">We look to implement a proper search-by-name feature to improve user experience on off_the_charts but, in the meantime, we directly use the sorare slug to retrieve player information.</p>
        <h2>Where to find the Sorare slug?</h2>
        <p className="page-paragraph">For most players, the slug is straightforward. For example, Joshua Kimmich&apos;s slug is simply joshua-kimmich. And for Declan Rice, the slug is declan-rice.</p>
        <p className="page-paragraph">Unfortunately <strong>there is no absolute rule</strong>, e.g. Kylian Mbappé&apos;s slug is kylian-mbappe-lottin. For Grimaldo, the slug is alejandro-grimaldo-garcia.</p>
        <p className="page-paragraph">Sorare also have to handle homonyms so they add middle-names, sometimes numbers or birth dates.</p>
            <p className="page-paragraph"><strong>Easiest way to get it right</strong> <strong>is through a Google search</strong>, typing “Sorare” and the player&apos;s name. If you are worried that there could be an homonym, just add the club name.</p>
            <p className="page-paragraph">The first result should be the player&apos;s page on Sorare</p>
            <img loading="lazy" width="600" height="220" src="/pictures/google-search.png" alt="" className="page-img" sizes="(max-width: 858px) 100vw, 858px" />
          <img loading="lazy" width="934" height="442" src="/pictures/wendel.png" alt="" className="page-img" sizes="(max-width: 934px) 100vw, 934px" />
          <img loading="lazy" width="793" height="450" src="/pictures/sergio-B.png" alt="" className="page-img" sizes="(max-width: 793px) 100vw, 793px" />
			</div>
    )
  }
