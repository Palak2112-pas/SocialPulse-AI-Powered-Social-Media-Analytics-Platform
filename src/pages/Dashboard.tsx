import { useState, useRef } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { KPICard } from "@/components/dashboard/KPICard";
import { EngagementChart } from "@/components/dashboard/EngagementChart";
import { PostingHeatmap } from "@/components/dashboard/PostingHeatmap";
import { ContentDNA } from "@/components/dashboard/ContentDNA";
import { StrategyChat } from "@/components/dashboard/StrategyChat";
import { EngagementAlerts } from "@/components/dashboard/EngagementAlerts";
import { ContentSimulator } from "@/components/dashboard/ContentSimulator";
import { WeeklySummary } from "@/components/dashboard/WeeklySummary";
import { ContentPerformance } from "@/components/dashboard/ContentPerformance";
import { SocialIntegrations } from "@/components/dashboard/SocialIntegrations";
import { Heart, MessageCircle, Share2, Eye, Users, TrendingUp } from "lucide-react";

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState("overview");
  const [platform, setPlatform] = useState("all");
  const [timeRange, setTimeRange] = useState("7d");
  const previousSection = useRef("overview");

  const handleSectionChange = (section: string) => {
    previousSection.current = activeSection;
    setActiveSection(section);
  };

  const handleBack = () => {
    setActiveSection(previousSection.current);
  };

  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              <KPICard
                title="Total Likes"
                value="34.8K"
                change={12.5}
                icon={Heart}
                color="coral"
                delay={0}
              />
              <KPICard
                title="Comments"
                value="5,623"
                change={8.2}
                icon={MessageCircle}
                color="primary"
                delay={50}
              />
              <KPICard
                title="Shares"
                value="2,847"
                change={-3.1}
                icon={Share2}
                color="violet"
                delay={100}
              />
              <KPICard
                title="Total Reach"
                value="245K"
                change={18.4}
                icon={Eye}
                color="accent"
                delay={150}
              />
              <KPICard
                title="Followers"
                value="12.4K"
                change={5.7}
                icon={Users}
                color="primary"
                delay={200}
              />
              <KPICard
                title="Engagement"
                value="4.8%"
                change={2.3}
                icon={TrendingUp}
                color="accent"
                delay={250}
              />
            </div>

            {/* Engagement Overview - Full Width */}
            <EngagementChart fullWidth />

            {/* AI Insights Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PostingHeatmap />
              <EngagementAlerts />
            </div>
          </div>
        );

      case "performance":
        return <ContentPerformance />;

      case "heatmap":
        return <PostingHeatmap />;

      case "dna":
        return <ContentDNA />;

      case "chat":
        return (
          <div className="max-w-3xl mx-auto">
            <StrategyChat />
          </div>
        );

      case "alerts":
        return <EngagementAlerts />;

      case "simulator":
        return <ContentSimulator />;

      case "summary":
        return <WeeklySummary />;

      case "integrations":
        return <SocialIntegrations />;

      default:
        return null;
    }
  };

  const sectionTitles: Record<string, { title: string; subtitle: string }> = {
    overview: { title: "Dashboard Overview", subtitle: "Your social media performance at a glance" },
    performance: { title: "Content Performance", subtitle: "Analyze individual post metrics with AI insights" },
    heatmap: { title: "Smart Posting Times", subtitle: "Discover your audience's most active hours" },
    dna: { title: "Content DNA Analyzer", subtitle: "Understand your content personality" },
    chat: { title: "Strategy Chat", subtitle: "Get AI-powered content recommendations" },
    alerts: { title: "Engagement Alerts", subtitle: "Stay informed about performance changes" },
    simulator: { title: "Performance Simulator", subtitle: "Predict engagement before you post" },
    summary: { title: "Weekly Summary", subtitle: "AI-generated performance report" },
    integrations: { title: "Connect Social Media Accounts", subtitle: "Connect your social platforms to start analytics" },
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar activeSection={activeSection} onSectionChange={handleSectionChange} />
      
      <div className="ml-64 transition-all duration-300">
        <Header
          platform={platform}
          onPlatformChange={setPlatform}
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
          showBackButton={activeSection === "integrations"}
          onBack={handleBack}
        />
        
        <main className="p-6">
          {/* Section Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-display font-bold text-foreground">
              {sectionTitles[activeSection]?.title}
            </h1>
            <p className="text-muted-foreground">
              {sectionTitles[activeSection]?.subtitle}
            </p>
          </div>

          {renderContent()}
        </main>
      </div>
    </div>
  );
}
