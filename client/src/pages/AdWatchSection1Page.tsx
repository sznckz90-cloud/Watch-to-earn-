import Layout from "@/components/Layout";
import AdWatchingSection from "@/components/AdWatchingSection";
import { useAuth } from "@/hooks/useAuth";

export default function AdWatchSection1Page() {
  const { user } = useAuth();
  return (
    <Layout>
      <div className="p-4 space-y-6">
        <h1 className="text-2xl font-black text-white uppercase italic">Speed Booster 1</h1>
        <p className="text-zinc-400 text-sm font-bold">Watch ads to increase your mining speed permanently!</p>
        <AdWatchingSection user={user} section="section1" />
      </div>
    </Layout>
  );
}
