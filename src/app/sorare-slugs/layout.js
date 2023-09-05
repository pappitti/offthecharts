import Footer from "../components/footer";

export default function PageLayout({
    children, // will be a page or nested layout
  }) {
    return (
      <section>
        <div className="content">
            {children}
        </div>   
        <Footer/>
      </section>
    )
  }