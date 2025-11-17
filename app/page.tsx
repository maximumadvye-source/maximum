import Billboard3D from '@/components/Billboard3D';
import Header from '@/components/Header';
import Services from '@/components/Services';
import Portfolio from '@/components/Portfolio';
import Contact from '@/components/Contact';
import '../styles/globals.css';

export const metadata = {
  title: '3D Billboard - Interactive Experience',
  description: 'Amazing 3D billboard website with interactive elements',
};

export default function Home() {
  return (
    <main className="w-full">
      <Header />
      <Billboard3D 
        title="3D Billboard"
        subtitle="Interactive Digital Experience"
        imageUrl="https://images.unsplash.com/photo-1634986066530-a5a0dbf2cbf1?w=1200"
      />
      <Services />
      <Portfolio />
      <Contact />
    </main>
  );
}
