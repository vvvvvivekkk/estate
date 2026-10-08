import Nav from './components/Nav'
import FilmHero from './components/FilmHero'
import { Overview, Architecture, Living, Specs, Viewing, Footer } from './components/Sections'

export default function App() {
  return (
    <>
      <Nav />
      <main id="top">
        <FilmHero />
        <div className="content">
          <Overview />
          <Architecture />
          <Living />
          <Specs />
          <Viewing />
        </div>
      </main>
      <Footer />
    </>
  )
}
