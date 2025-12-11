"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface NewsArticle {
  id: string
  title: string
  description?: string
  url: string
  source: string
  image_url?: string
  published_at: string
  tickers?: string[]
  sentiment?: string
  is_pinned: boolean
  is_trusted: boolean
}

export default function AdminNewsPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    url: "",
    source: "",
    image_url: "",
    published_at: new Date().toISOString().slice(0, 16),
    tickers: "",
    sentiment: "neutral",
    is_pinned: false,
    is_trusted: true,
  })

  useEffect(() => {
    loadArticles()
  }, [page])

  const loadArticles = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/news/list?page=${page}&limit=20`)
      const data = await response.json()

      if (data.success) {
        setArticles(data.articles)
        setTotalPages(data.pagination.total_pages)
      }
    } catch (error) {
      console.error("[v0] Failed to load articles:", error)
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const payload = {
      ...formData,
      tickers: formData.tickers.split(",").map((t) => t.trim()),
      published_at: new Date(formData.published_at).toISOString(),
    }

    try {
      const response = await fetch("/api/admin/news", {
        method: editingArticle ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingArticle ? { ...payload, id: editingArticle.id } : payload),
      })

      const data = await response.json()

      if (data.success) {
        setIsDialogOpen(false)
        setEditingArticle(null)
        resetForm()
        loadArticles()
      } else {
        alert(data.error || "Failed to save article")
      }
    } catch (error) {
      console.error("[v0] Save error:", error)
      alert("Failed to save article")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this article?")) return

    try {
      const response = await fetch(`/api/admin/news?id=${id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.success) {
        loadArticles()
      } else {
        alert(data.error || "Failed to delete article")
      }
    } catch (error) {
      console.error("[v0] Delete error:", error)
      alert("Failed to delete article")
    }
  }

  const handleEdit = (article: NewsArticle) => {
    setEditingArticle(article)
    setFormData({
      title: article.title,
      description: article.description || "",
      url: article.url,
      source: article.source,
      image_url: article.image_url || "",
      published_at: new Date(article.published_at).toISOString().slice(0, 16),
      tickers: article.tickers?.join(", ") || "",
      sentiment: article.sentiment || "neutral",
      is_pinned: article.is_pinned,
      is_trusted: article.is_trusted,
    })
    setIsDialogOpen(true)
  }

  const handleTogglePin = async (article: NewsArticle) => {
    try {
      const response = await fetch("/api/admin/news", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: article.id,
          is_pinned: !article.is_pinned,
        }),
      })

      const data = await response.json()

      if (data.success) {
        loadArticles()
      }
    } catch (error) {
      console.error("[v0] Toggle pin error:", error)
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      url: "",
      source: "",
      image_url: "",
      published_at: new Date().toISOString().slice(0, 16),
      tickers: "",
      sentiment: "neutral",
      is_pinned: false,
      is_trusted: true,
    })
  }

  const handleManualIngest = async () => {
    if (!confirm("Manually trigger news ingestion? This may take a few moments.")) return

    try {
      const response = await fetch("/api/news/ingest")
      const data = await response.json()

      if (data.success) {
        alert(`Successfully ingested ${data.inserted} new articles`)
        loadArticles()
      } else {
        alert(data.error || "Failed to ingest news")
      }
    } catch (error) {
      console.error("[v0] Manual ingest error:", error)
      alert("Failed to ingest news")
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">News Administration</h1>
        <div className="flex gap-2">
          <Button onClick={handleManualIngest} variant="outline">
            Refresh News
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingArticle(null)
                  resetForm()
                }}
              >
                Add Article
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingArticle ? "Edit Article" : "Add New Article"}</DialogTitle>
                <DialogDescription>
                  {editingArticle ? "Update the article details" : "Create a new news article manually"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="url">URL</Label>
                  <Input
                    id="url"
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="source">Source</Label>
                    <Input
                      id="source"
                      value={formData.source}
                      onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="published_at">Published Date</Label>
                    <Input
                      id="published_at"
                      type="datetime-local"
                      value={formData.published_at}
                      onChange={(e) => setFormData({ ...formData, published_at: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="image_url">Image URL</Label>
                  <Input
                    id="image_url"
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="tickers">Tickers (comma separated)</Label>
                  <Input
                    id="tickers"
                    value={formData.tickers}
                    onChange={(e) => setFormData({ ...formData, tickers: e.target.value })}
                    placeholder="AAPL, TSLA, MSFT"
                  />
                </div>
                <div>
                  <Label htmlFor="sentiment">Sentiment</Label>
                  <Select
                    value={formData.sentiment}
                    onValueChange={(value) => setFormData({ ...formData, sentiment: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="positive">Positive</SelectItem>
                      <SelectItem value="neutral">Neutral</SelectItem>
                      <SelectItem value="negative">Negative</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_pinned}
                      onChange={(e) => setFormData({ ...formData, is_pinned: e.target.checked })}
                    />
                    Pin Article
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_trusted}
                      onChange={(e) => setFormData({ ...formData, is_trusted: e.target.checked })}
                    />
                    Trusted Source
                  </label>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">{editingArticle ? "Update" : "Create"}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading articles...</div>
      ) : (
        <div className="space-y-4">
          {articles.map((article) => (
            <Card key={article.id} className="p-4">
              <div className="flex gap-4">
                {article.image_url && (
                  <img
                    src={article.image_url || "/placeholder.svg"}
                    alt={article.title}
                    className="w-32 h-20 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{article.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{article.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline">{article.source}</Badge>
                        {article.sentiment && (
                          <Badge
                            variant={
                              article.sentiment === "positive"
                                ? "default"
                                : article.sentiment === "negative"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {article.sentiment}
                          </Badge>
                        )}
                        {article.is_pinned && <Badge variant="secondary">Pinned</Badge>}
                        {article.tickers?.map((ticker) => (
                          <Badge key={ticker} variant="outline">
                            {ticker}
                          </Badge>
                        ))}
                        <span className="text-xs text-muted-foreground">
                          {new Date(article.published_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleTogglePin(article)}>
                        {article.is_pinned ? "Unpin" : "Pin"}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleEdit(article)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(article.id)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {!loading && articles.length > 0 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <Button variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
            Previous
          </Button>
          <span className="text-sm">
            Page {page} of {totalPages}
          </span>
          <Button variant="outline" onClick={() => setPage((p) => p + 1)} disabled={page === totalPages}>
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
