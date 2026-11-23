const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");

class APIError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

class PolicyAPI {
  private async request<T>(path: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    if (!res.ok) {
      let errorMessage = "API error";
      try {
        const errorData = await res.json();
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } catch (e) {
        errorMessage = await res.text();
      }
      throw new APIError(res.status, errorMessage);
    }
    return res.json();
  }

  // Analytics
  getAnalyticsBundle() {
    return this.request<any>("/analytics/bundle");
  }
  getSummary() {
    return this.request<any>("/analytics/summary");
  }
  getFundingByMinistry() {
    return this.request<any[]>("/analytics/funding-by-ministry");
  }
  getSectorDistribution() {
    return this.request<any[]>("/analytics/sector-distribution");
  }
  getStageCoverage() {
    return this.request<any[]>("/analytics/stage-coverage");
  }

  // Alerts
  getRecentAlerts(days: number = 7) {
    return this.request<any>(`/alerts/recent?days=${days}`);
  }

  // Schemes
  getSchemes(params?: Record<string, string>) {
    const query = new URLSearchParams(params || {}).toString();
    const qStr = query ? `?${query}` : "";
    return this.request<any>(`/schemes${qStr}`);
  }

  // Recommender
  getRecommendations(profile: { sector: string, stage: string, state: string }) {
    return this.request<any>("/recommend", {
      method: "POST",
      body: JSON.stringify(profile)
    });
  }

  // Evaluate single scheme against user profile
  evaluateScheme(profile: { sector: string, stage: string, state: string, startup_name: string, scheme_id: string }) {
    return this.request<any>("/evaluate-scheme", {
      method: "POST",
      body: JSON.stringify(profile)
    });
  }

  // Pipeline Status
  getPipelineStatus() {
    return this.request<any>("/pipeline/status");
  }

  // Dashboard & Success Stories
  getDetailedAnalytics() {
    return this.request<any>("/analytics/detailed");
  }
  getSuccessStories() {
    return this.request<any>("/success-stories");
  }
  
  // GOV-BOT Chat
  chat(message: string, history: any[]) {
    return this.request<any>("/chat", {
      method: "POST",
      body: JSON.stringify({ message, history })
    });
  }
  chatAboutScheme(scheme_id: string, message: string, history: any[]) {
    return this.request<any>("/chat/scheme", {
      method: "POST",
      body: JSON.stringify({ scheme_id, message, history })
    });
  }
}

export const api = new PolicyAPI();
