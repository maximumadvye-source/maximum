import { redirect } from 'next/navigation';

// صفحة «عن الموقع» القديمة كانت وصفاً تقنياً للقالب — أُلغيت وصار التعريف في الصفحة الرئيسية.
export default function About() {
  redirect('/');
}
