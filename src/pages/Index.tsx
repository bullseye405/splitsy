import { LandingPage } from '@/components/landing/LandingPage';

const Index = () => {
  const today = new Date();
  const currentYear = today.getFullYear().toString();
  const currentMonth = (today.getMonth() + 1).toString().padStart(2, '0');
  const currentDay = today.getDate().toString().padStart(2, '0');
  console.log(`/${currentYear}/${currentMonth}/${currentDay}`);
  return <LandingPage />;
};

export default Index;
