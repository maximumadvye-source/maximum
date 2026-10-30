import Billboard3D from '@/components/Billboard3D';
import Header from '@/components/Header';
import Services from '@/components/Services';
import Portfolio from '@/components/Portfolio';
import Contact from '@/components/Contact';
import '../styles/globals.css';

export const metadata = {
  title: '  كهربائي صنعاء - ادم ',
  description: 'أفضل خدمات الكهرباء مع أعمال احترافية في صنعاء',
};

export default function Home() {
  return (
    <main className="w-full" dir="rtl">
      <Header />
      <Billboard3D 
     title="كهربائي صنعاء"
  subtitle="أفضل خدمات الكهرباء بخبرة عالية"
        imageUrl="https://images.unsplash.com/photo-1634986066530-a5a0dbf2cbf1?w=1200"
      />
      <Services />
      <Portfolio />
      <Contact />
    </main>
  );
}
