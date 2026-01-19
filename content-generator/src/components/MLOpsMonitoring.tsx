import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, TrendingUp, DollarSign, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function MLOpsMonitoring() {
    const [metrics, setMetrics] = useState<any>(null);
    const [comparison, setComparison] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchMetrics();
        // Refresh every 30 seconds
        const interval = setInterval(fetchMetrics, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchMetrics = async () => {
        try {
            setLoading(true);
            const [metricsRes, comparisonRes] = await Promise.all([
                fetch(`${API_BASE}/api/metrics`),
                fetch(`${API_BASE}/api/metrics/comparison`)
            ]);

            if (!metricsRes.ok || !comparisonRes.ok) {
                throw new Error('Failed to fetch metrics');
            }

            const metricsData = await metricsRes.json();
            const comparisonData = await comparisonRes.json();

            setMetrics(metricsData);
            setComparison(comparisonData);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load metrics');
        } finally {
            setLoading(false);
        }
    };

    if (loading && !metrics) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading metrics...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <Card className="border-destructive">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5" />
                        Error Loading Metrics
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">{error}</p>
                    <button
                        onClick={fetchMetrics}
                        className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                    >
                        Retry
                    </button>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-bold tracking-tight mb-2">MLOps Monitoring</h2>
                <p className="text-muted-foreground">
                    Real-time analytics and performance metrics for your AI content generation platform
                </p>
            </div>

            {/* Overall Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total API Calls</CardTitle>
                        <BarChart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics?.overall?.total_calls || 0}</div>
                        <p className="text-xs text-muted-foreground">Across all endpoints</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ${metrics?.overall?.total_cost_usd?.toFixed(4) || '0.0000'}
                        </div>
                        <p className="text-xs text-muted-foreground">OpenAI API usage</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Latency</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {metrics?.overall?.avg_latency_ms?.toFixed(0) || 0}ms
                        </div>
                        <p className="text-xs text-muted-foreground">Response time</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {metrics?.overall?.success_rate_pct?.toFixed(1) || 0}%
                        </div>
                        <p className="text-xs text-muted-foreground">Successful calls</p>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs for different views */}
            <Tabs defaultValue="endpoints" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="endpoints">By Endpoint</TabsTrigger>
                    <TabsTrigger value="quality">Quality Scores</TabsTrigger>
                    <TabsTrigger value="comparison">A/B Testing</TabsTrigger>
                </TabsList>

                {/* Endpoint Stats */}
                <TabsContent value="endpoints" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Performance by Endpoint</CardTitle>
                            <CardDescription>Detailed metrics for each generation endpoint</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {metrics?.by_endpoint?.map((endpoint: any) => (
                                    <div key={endpoint.endpoint} className="border rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="font-semibold capitalize">{endpoint.endpoint}</h3>
                                            <Badge variant="secondary">{endpoint.call_count} calls</Badge>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4 text-sm">
                                            <div>
                                                <p className="text-muted-foreground">Avg Latency</p>
                                                <p className="font-medium">{endpoint.avg_latency_ms.toFixed(0)}ms</p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">Total Cost</p>
                                                <p className="font-medium">${endpoint.total_cost_usd.toFixed(4)}</p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">Avg Tokens</p>
                                                <p className="font-medium">{endpoint.avg_tokens}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Quality Scores */}
                <TabsContent value="quality" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Content Quality Metrics</CardTitle>
                            <CardDescription>Average quality scores across all generated content</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {[
                                    { name: 'SEO Score', value: metrics?.quality_scores?.avg_seo_score },
                                    { name: 'Readability Score', value: metrics?.quality_scores?.avg_readability_score },
                                    { name: 'Relevance Score', value: metrics?.quality_scores?.avg_relevance_score },
                                    { name: 'Overall Score', value: metrics?.quality_scores?.avg_overall_score },
                                ].map((score) => (
                                    <div key={score.name}>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium">{score.name}</span>
                                            <span className="text-sm font-semibold">{(score.value * 100).toFixed(0)}%</span>
                                        </div>
                                        <div className="w-full bg-secondary rounded-full h-2">
                                            <div
                                                className="bg-primary h-2 rounded-full transition-all"
                                                style={{ width: `${(score.value || 0) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* A/B Comparison */}
                <TabsContent value="comparison" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>DSPy vs Manual Prompts</CardTitle>
                            <CardDescription>Performance comparison between prompt versions</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {comparison?.summary && (
                                <div className="mb-6 p-4 bg-secondary rounded-lg">
                                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4" />
                                        Recommendation
                                    </h4>
                                    <p className="text-sm">{comparison.summary.recommendation}</p>

                                    {comparison.summary.dspy_advantages?.length > 0 && (
                                        <div className="mt-3">
                                            <p className="text-sm font-medium mb-1">DSPy Advantages:</p>
                                            <ul className="text-sm text-muted-foreground space-y-1">
                                                {comparison.summary.dspy_advantages.map((adv: string, i: number) => (
                                                    <li key={i}>✓ {adv}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="space-y-4">
                                {comparison?.comparison?.map((item: any, idx: number) => (
                                    <div key={idx} className="border rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="font-semibold capitalize">{item.endpoint}</h3>
                                            <Badge variant={item.prompt_version === 'dspy-optimized' ? 'default' : 'outline'}>
                                                {item.prompt_version}
                                            </Badge>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p className="text-muted-foreground">Quality Score</p>
                                                <p className="font-medium">
                                                    {((item.quality?.avg_overall_score || 0) * 100).toFixed(1)}%
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">Avg Latency</p>
                                                <p className="font-medium">{item.avg_latency_ms.toFixed(0)}ms</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
