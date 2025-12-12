import dynamic from 'next/dynamic';

const Billboard3D = dynamic(() => import('@/components/Billboard3D'), { ssr: false });
const Header = dynamic(() => import('@/components/Header'), { ssr: false });
const Services = dynamic(() => import('@/components/Services'), { ssr: false });
const Portfolio = dynamic(() => import('@/components/Portfolio'), { ssr: false });
const Contact = dynamic(() => import('@/components/Contact'), { ssr: false });
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
        title="حلول كهربائية متكاملة واحترافية في صنعاء"
        subtitle="تصميم وتنفيذ وصيانة أنظمة كهربائية بمواصفات عالية وباعتماد معايير الجهة المختصة."
      />
      <Services />
      <Portfolio />
      <Contact />
    </main>
  );
}
