import React from 'react';
import { Calendar, MapPin, Heart, Clock } from 'lucide-react';

const App = () => {
  return (
    <div className="min-h-screen bg-light-gold text-maroon p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto border-4 border-gold rounded-lg p-6 md:p-12 shadow-xl bg-white/50 backdrop-blur-sm relative overflow-hidden">

        {/* Decorative corner borders */}
        <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-maroon rounded-tl-lg m-4"></div>
        <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-maroon rounded-tr-lg m-4"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-maroon rounded-bl-lg m-4"></div>
        <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-maroon rounded-br-lg m-4"></div>

        <header className="text-center space-y-6 mb-16 pt-8">
          <p className="tracking-widest uppercase text-sm md:text-base font-semibold">With the blessings of our families</p>
          <p className="text-lg md:text-xl italic">We invite you to share our joy at the wedding of</p>

          <h1 className="text-6xl md:text-8xl font-script text-maroon my-8">
            Rohan <br className="md:hidden"/> & <br className="md:hidden"/> Priya
          </h1>

          <div className="flex items-center justify-center space-x-4 text-gold">
            <div className="h-px bg-gold w-16 md:w-32"></div>
            <Heart size={24} fill="currentColor" />
            <div className="h-px bg-gold w-16 md:w-32"></div>
          </div>
        </header>

        <main className="space-y-16">
          <section className="text-center space-y-4">
            <h2 className="text-3xl font-bold uppercase tracking-wider mb-8 border-b-2 border-gold inline-block pb-2">Events</h2>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white/80 p-6 rounded-md shadow-sm border border-maroon/20 hover:border-maroon/50 transition-colors">
                <h3 className="text-2xl font-script font-bold mb-2">Haldi & Mehendi</h3>
                <div className="flex items-center justify-center space-x-2 text-sm mb-1">
                  <Calendar size={16} />
                  <span>Friday, October 25, 2024</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-sm">
                  <Clock size={16} />
                  <span>10:00 AM onwards</span>
                </div>
                <p className="mt-4 italic text-sm">Dress code: Vibrant Yellows and Greens</p>
              </div>

              <div className="bg-white/80 p-6 rounded-md shadow-sm border border-maroon/20 hover:border-maroon/50 transition-colors">
                <h3 className="text-2xl font-script font-bold mb-2">Sangeet</h3>
                <div className="flex items-center justify-center space-x-2 text-sm mb-1">
                  <Calendar size={16} />
                  <span>Friday, October 25, 2024</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-sm">
                  <Clock size={16} />
                  <span>7:00 PM onwards</span>
                </div>
                <p className="mt-4 italic text-sm">Dress code: Glamorous & Festive</p>
              </div>

              <div className="bg-white/80 p-6 rounded-md shadow-sm border border-maroon/20 hover:border-maroon/50 transition-colors md:col-span-2 md:w-2/3 mx-auto">
                <h3 className="text-2xl font-script font-bold mb-2">Wedding Ceremony</h3>
                <div className="flex items-center justify-center space-x-2 text-sm mb-1">
                  <Calendar size={16} />
                  <span>Saturday, October 26, 2024</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-sm">
                  <Clock size={16} />
                  <span>Muhurat at 11:30 AM</span>
                </div>
                <p className="mt-4 italic text-sm">Followed by lunch</p>
              </div>
            </div>
          </section>

          <section className="text-center space-y-4">
            <h2 className="text-3xl font-bold uppercase tracking-wider mb-8 border-b-2 border-gold inline-block pb-2">Venue</h2>
            <div className="bg-white/80 p-6 rounded-md shadow-sm border border-maroon/20 inline-block">
              <h3 className="text-xl font-bold mb-2">The Grand Taj Palace</h3>
              <p className="flex items-center justify-center space-x-2">
                <MapPin size={18} />
                <span>123 Royal Avenue, Mumbai, Maharashtra 400001</span>
              </p>
            </div>
          </section>

          <section className="text-center space-y-6 pt-8 border-t border-maroon/20">
            <h2 className="text-3xl font-bold uppercase tracking-wider mb-4 border-b-2 border-gold inline-block pb-2">RSVP</h2>
            <p className="mb-4">Please let us know if you can join us on our special day.</p>
            <form className="max-w-md mx-auto space-y-4 text-left">
              <div>
                <label className="block text-sm font-bold mb-1" htmlFor="name">Name(s)</label>
                <input className="w-full p-2 border border-maroon rounded focus:outline-none focus:ring-2 focus:ring-gold bg-white/90" type="text" id="name" placeholder="E.g., Mr. & Mrs. Sharma" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1" htmlFor="attending">Will you attend?</label>
                <select className="w-full p-2 border border-maroon rounded focus:outline-none focus:ring-2 focus:ring-gold bg-white/90" id="attending">
                  <option>Joyfully Accept</option>
                  <option>Regretfully Decline</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1" htmlFor="guests">Number of Guests</label>
                <input className="w-full p-2 border border-maroon rounded focus:outline-none focus:ring-2 focus:ring-gold bg-white/90" type="number" id="guests" min="1" max="10" defaultValue="1" />
              </div>
              <button className="w-full bg-maroon text-light-gold font-bold py-3 rounded mt-4 hover:bg-red-900 transition-colors uppercase tracking-widest shadow-md" type="button" onClick={(e) => { e.preventDefault(); alert("Thanks for your RSVP!"); }}>
                Send RSVP
              </button>
            </form>
          </section>
        </main>
        
        <footer className="text-center mt-16 pt-8 pb-4 text-sm opacity-80">
          <p>We look forward to celebrating with you!</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
