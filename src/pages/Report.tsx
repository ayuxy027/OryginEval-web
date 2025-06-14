import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Plus, Timer, AlertTriangle, Smile, ListChecks, Lightbulb, Target, ShieldAlert, TrendingUp, BarChartHorizontalBig, Info, LineChart as LineChartLucide, Radar as RadarLucide } from "lucide-react"; // Aliased LineChart and Radar
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip, // Renamed to avoid conflict with shadcn/ui Tooltip
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line,
  Legend,
} from "recharts";

// Define interfaces for the new data structure
interface EvaluationDetail {
  name: string;
  score: number;
  comment: string;
}

interface EvalResult {
  convoid: string;
  response_time: number;
  evaluations: EvaluationDetail[];
}

interface OverallEvalResults {
  conversations_tested: number;
  average_response_time: number;
  Hallucination: number;
  "Semantic Similarity": number;
  "Accuracy Score"?: number; // Added as per request, optional
  "Toxicity Score"?: number; // Added as per request, optional
}

interface ReportData {
  overall_eval_results: OverallEvalResults;
  insights: string[];
  eval_results: EvalResult[];
}

// Sample data provided by the user
const sampleReportData: ReportData = {
  overall_eval_results: {
    conversations_tested: 10,
    average_response_time: 4.79,
    Hallucination: 0.17,
    "Semantic Similarity": 0.91,
    "Accuracy Score": 0.88, // Placeholder value
    "Toxicity Score": 0.05, // Placeholder value
  },
  insights: [
    "The bot occasionally repeats questions, leading to a slightly higher hallucination score in some conversations.",
    "The bot tends to provide a complete itinerary in the final response, which goes beyond the scope of the ideal chat flow.",
    "Semantic similarity scores are generally high, indicating that the bot effectively captures user preferences and maintains a relevant conversation flow.",
    "Hallucination scores are generally low, suggesting that the bot's responses are mostly grounded and relevant to the user's input.",
  ],
  eval_results: [
    {
      convoid: "convoid1",
      response_time: 4.7,
      evaluations: [
        { name: "Hallucination", score: 0.7, comment: "The assistant in the actual chat asks for the same information multiple times, like name and travel companions. Also, it provides the entire itinerary at the end, which wasn't in the ideal chat. Therefore, the hallucination score is high." },
        { name: "Semantic Similarity", score: 0.95, comment: "The actual chat follows the same flow and asks the same questions as the ideal chat, with minor variations in phrasing. The information gathered is the same, and the final output is a trip plan, which wasn't explicitly part of the ideal chat, but is a logical continuation. Therefore, the semantic similarity is high." },
      ],
    },
    {
      convoid: "convoid2",
      response_time: 5.92,
      evaluations: [
        { name: "Hallucination", score: 0.4, comment: "The actual chat has some hallucinations. The assistant is asking the same question multiple times. Also, the assistant is providing irrelevant responses." },
        { name: "Semantic Similarity", score: 0.85, comment: "The actual chat follows a similar flow to the ideal chat, asking relevant questions to gather information about the user's preferences for their trip. However, the ideal chat's initial greetings and questions are slightly more tailored and welcoming. The actual chat also provides a trip plan at the end, which is beyond the scope of the ideal chat." },
      ],
    },
    { convoid: "convoid3", response_time: 5.91, evaluations: [{ name: "Hallucination", score: 0.0, comment: "No hallucination." },{ name: "Semantic Similarity", score: 0.95, comment: "Very similar." }] },
    { convoid: "convoid4", response_time: 3.66, evaluations: [{ name: "Hallucination", score: 0.0, comment: "No hallucination." },{ name: "Semantic Similarity", score: 0.92, comment: "Highly similar." }] },
    { convoid: "convoid5", response_time: 3.72, evaluations: [{ name: "Hallucination", score: 0.1, comment: "Minor hallucination." },{ name: "Semantic Similarity", score: 0.85, comment: "Similar, but final response differs." }] },
    { convoid: "convoid6", response_time: 5.29, evaluations: [{ name: "Hallucination", score: 0.0, comment: "No hallucination." },{ name: "Semantic Similarity", score: 0.95, comment: "Quite similar." }] },
    { convoid: "convoid7", response_time: 4.54, evaluations: [{ name: "Hallucination", score: 0.3, comment: "Some hallucination, irrelevant suggestions." },{ name: "Semantic Similarity", score: 0.85, comment: "Very similar flow." }] },
    { convoid: "convoid8", response_time: 4.6, evaluations: [{ name: "Hallucination", score: 0.0, comment: "No hallucination." },{ name: "Semantic Similarity", score: 0.95, comment: "Closely mirrors ideal chat." }] },
    { convoid: "convoid9", response_time: 4.47, evaluations: [{ name: "Hallucination", score: 0.0, comment: "No hallucination." },{ name: "Semantic Similarity", score: 0.9, comment: "Similar flow, more conversational." }] },
    { convoid: "convoid10", response_time: 5.1, evaluations: [{ name: "Hallucination", score: 0.15, comment: "Minor deviations." },{ name: "Semantic Similarity", score: 0.95, comment: "Closely aligned." }] },
  ],
};

const Report: React.FC = () => {
  const navigate = useNavigate();
  // const { projectId } = useParams<{ projectId: string }>(); // Keep if needed for navigation
  const [isLoading, setIsLoading] = useState(true);
  const [reportData, setReportData] = useState<ReportData | null>(null);

  useEffect(() => {
    // Simulate data fetching
    setIsLoading(true);
    setTimeout(() => {
      setReportData(sampleReportData);
      setIsLoading(false);
    }, 1000); // Simulate network delay
  }, []);

  // Helper function to get letter grade and color
  const getGrade = (score: number): { grade: string; color: string } => {
    if (score >= 0.9) return { grade: "A", color: "text-green-500" };
    if (score >= 0.8) return { grade: "B", color: "text-blue-500" };
    if (score >= 0.7) return { grade: "C", color: "text-yellow-500" };
    if (score >= 0.6) return { grade: "D", color: "text-orange-500" };
    return { grade: "F", color: "text-red-500" };
  };
  
  // Prepare chart data
  const overallMetricsForChart = reportData
    ? [
        { subject: "Hallucination", score: reportData.overall_eval_results.Hallucination, fullMark: 1 },
        { subject: "Semantic Similarity", score: reportData.overall_eval_results["Semantic Similarity"], fullMark: 1 },
        { subject: "Accuracy", score: reportData.overall_eval_results["Accuracy Score"] || 0, fullMark: 1 },
        // Toxicity is often better represented as lower is better, adjust if needed for radar.
        // For this radar, we'll assume higher score means less toxicity for consistency, or invert the value.
        // Or, show it separately. For now, including it as higher is better (1-toxicity).
        { subject: "Non-Toxicity", score: 1 - (reportData.overall_eval_results["Toxicity Score"] || 0), fullMark: 1 },
      ]
    : [];

  const conversationScoresForChart = reportData
    ? reportData.eval_results.map((conv) => ({
        name: conv.convoid.replace("convoid", "C"), // Shorten name
        Hallucination: conv.evaluations.find((e) => e.name === "Hallucination")?.score || 0,
        "Semantic Similarity": conv.evaluations.find((e) => e.name === "Semantic Similarity")?.score || 0,
      }))
    : [];

  const responseTimesForChart = reportData
    ? reportData.eval_results.map((conv) => ({
        name: conv.convoid.replace("convoid", "C"), // Shorten name
        "Response Time (s)": conv.response_time,
      }))
    : [];

  const overallMetricsCardsData = reportData ? [
    { title: "Conversations Tested", value: reportData.overall_eval_results.conversations_tested.toString(), IconComponent: ListChecks, note: "Total interactions evaluated" },
    { title: "Avg. Response Time", value: `${reportData.overall_eval_results.average_response_time.toFixed(2)}s`, IconComponent: Timer, note: "Average bot response speed" },
    { title: "Hallucination Score", value: reportData.overall_eval_results.Hallucination.toFixed(2), IconComponent: AlertTriangle, note: "Lower is better (0-1 scale)" },
    { title: "Semantic Similarity", value: reportData.overall_eval_results["Semantic Similarity"].toFixed(2), IconComponent: Smile, note: "Higher is better (0-1 scale)" },
    { title: "Accuracy Score", value: (reportData.overall_eval_results["Accuracy Score"] || 0).toFixed(2), IconComponent: Target, note: "Overall correctness (0-1 scale)" },
    { title: "Toxicity Score", value: (reportData.overall_eval_results["Toxicity Score"] || 0).toFixed(2), IconComponent: ShieldAlert, note: "Lower is better (0-1 scale)" },
  ] : [];


  if (isLoading) {
    return (
      <div className="space-y-6 p-6 md:p-10">
        <div className="h-8 bg-muted rounded w-1/3 animate-pulse mb-6"></div>
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-5 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/3"></div>
              </CardHeader>
              <CardContent>
                <div className="h-10 bg-muted rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="animate-pulse mt-6">
            <CardHeader><div className="h-6 bg-muted rounded w-1/4"></div></CardHeader>
            <CardContent><div className="h-20 bg-muted rounded"></div></CardContent>
        </Card>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-center p-6">
        <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Info className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No Report Data Available</h3>
        <p className="text-muted-foreground mb-6">
          There was an issue loading the report data or no data exists.
        </p>
        <Button
          onClick={() => navigate("/")} // Navigate to a relevant page, e.g., dashboard or projects
          className="gap-2 bg-primary hover:bg-orygin-red-hover text-white"
        >
          Go to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-8 p-4 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Evaluation Report</h1>
            <p className="text-muted-foreground">
              Detailed analysis of the latest evaluation run.
            </p>
          </div>
          <Button
            onClick={() => navigate("/projects/projectId/evaluation/create-experiment")} // Replace projectId with actual if available
            className="gap-2 bg-primary hover:bg-orygin-red-hover text-primary-foreground"
          >
            <Plus className="h-4 w-4" />
            New Experiment
          </Button>
        </div>

        {/* Overall Metrics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {overallMetricsCardsData.map((metric, index) => (
            <Card key={index} className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {metric.title}
                </CardTitle>
                <metric.IconComponent className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{metric.value}</div>
                <p className="text-xs text-muted-foreground pt-1">{metric.note}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-1 md:grid-cols-3">
            <TabsTrigger value="overview">Overview & Insights</TabsTrigger>
            <TabsTrigger value="visualizations">Visualizations</TabsTrigger>
            <TabsTrigger value="conversations">Conversation Details</TabsTrigger>
          </TabsList>

          {/* Overview & Insights Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-6 w-6 text-primary" />
                  Key Insights
                </CardTitle>
                <CardDescription>
                  Actionable observations from the evaluation results.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 list-disc list-inside text-muted-foreground">
                  {reportData.insights.map((insight, index) => (
                    <li key={index} className="pl-2">{insight}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <RadarLucide className="h-6 w-6 text-primary" />
                    Overall Metric Scores
                </CardTitle>
                <CardDescription>Visual representation of overall performance metrics.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={overallMetricsForChart}>
                      <PolarGrid stroke="hsl(var(--border))" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 1]} tick={{ fill: "hsl(var(--muted-foreground))" }} />
                      <Radar name="Score" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.6} />
                      <RechartsTooltip
                        contentStyle={{ backgroundColor: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius)", color: "hsl(var(--popover-foreground))" }}
                        formatter={(value: number, name: string) => [`${(value * 100).toFixed(0)}%`, name]}
                        labelFormatter={(label: string) => <span style={{ fontWeight: 'bold' }}>{label}</span>}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Visualizations Tab */}
          <TabsContent value="visualizations" className="space-y-6">
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChartLucide className="h-6 w-6 text-primary" />
                    Response Time Distribution
                  </CardTitle>
                  <CardDescription>Response times for each conversation.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={responseTimesForChart} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                        <YAxis tickFormatter={(value) => `${value}s`} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                        <RechartsTooltip
                          contentStyle={{ backgroundColor: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius)", color: "hsl(var(--popover-foreground))" }}
                          formatter={(value: number) => [`${value.toFixed(2)}s`, "Response Time"]}
                        />
                        <Legend wrapperStyle={{ fontSize: "12px" }} />
                        <Line type="monotone" dataKey="Response Time (s)" stroke="hsl(var(--primary))" strokeWidth={2} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChartHorizontalBig className="h-6 w-6 text-primary" />
                    Scores per Conversation
                  </CardTitle>
                  <CardDescription>Hallucination and Semantic Similarity scores across conversations.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={conversationScoresForChart} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                        <YAxis domain={[0, 1]} tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                        <RechartsTooltip
                          contentStyle={{ backgroundColor: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius)", color: "hsl(var(--popover-foreground))" }}
                          formatter={(value: number, name: string) => [`${(value * 100).toFixed(0)}%`, name]}
                        />
                        <Legend wrapperStyle={{ fontSize: "12px" }} />
                        <Bar dataKey="Hallucination" fill="hsl(var(--primary) / 0.6)" name="Hallucination" />
                        <Bar dataKey="Semantic Similarity" fill="hsl(var(--primary))" name="Semantic Similarity" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Conversation Details Tab */}
          <TabsContent value="conversations">
            <Card>
              <CardHeader>
                <CardTitle>Conversation Breakdown</CardTitle>
                <CardDescription>
                  Detailed scores and comments for each conversation.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] w-full rounded-md border border-border">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background z-10">
                      <TableRow>
                        <TableHead className="w-[100px]">Convo ID</TableHead>
                        <TableHead className="text-center">Resp. Time (s)</TableHead>
                        <TableHead className="text-center">Hallucination</TableHead>
                        <TableHead className="text-center">Sem. Similarity</TableHead>
                        <TableHead className="text-right w-[100px]">Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportData.eval_results.map((conv) => {
                        const hallucinationEval = conv.evaluations.find(e => e.name === "Hallucination");
                        const semanticSimilarityEval = conv.evaluations.find(e => e.name === "Semantic Similarity");
                        const hallucinationGrade = hallucinationEval ? getGrade(hallucinationEval.score) : { grade: 'N/A', color: 'text-muted-foreground' };
                        const semanticSimilarityGrade = semanticSimilarityEval ? getGrade(semanticSimilarityEval.score) : { grade: 'N/A', color: 'text-muted-foreground' };

                        return (
                          <TableRow key={conv.convoid}>
                            <TableCell className="font-medium">{conv.convoid}</TableCell>
                            <TableCell className="text-center">{conv.response_time.toFixed(2)}</TableCell>
                            <TableCell className="text-center">
                              <span className={`font-semibold ${hallucinationGrade.color}`}>
                                {hallucinationEval ? hallucinationEval.score.toFixed(2) : 'N/A'}
                              </span>
                              <span className="text-xs text-muted-foreground ml-1">({hallucinationGrade.grade})</span>
                            </TableCell>
                            <TableCell className="text-center">
                              <span className={`font-semibold ${semanticSimilarityGrade.color}`}>
                                {semanticSimilarityEval ? semanticSimilarityEval.score.toFixed(2) : 'N/A'}
                              </span>
                              <span className="text-xs text-muted-foreground ml-1">({semanticSimilarityGrade.grade})</span>
                            </TableCell>
                            <TableCell className="text-right">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <Info className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="left" className="max-w-xs text-sm p-3 bg-popover text-popover-foreground border-border shadow-lg rounded-md">
                                  {hallucinationEval && (
                                    <div className="mb-2">
                                      <p className="font-semibold">Hallucination Comment:</p>
                                      <p className="text-xs">{hallucinationEval.comment}</p>
                                    </div>
                                  )}
                                  {semanticSimilarityEval && (
                                    <div>
                                      <p className="font-semibold">Semantic Similarity Comment:</p>
                                      <p className="text-xs">{semanticSimilarityEval.comment}</p>
                                    </div>
                                  )}
                                  {(!hallucinationEval && !semanticSimilarityEval) && <p>No comments available.</p>}
                                </TooltipContent>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
};

export default Report;
