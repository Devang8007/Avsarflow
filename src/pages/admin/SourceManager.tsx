import React, { useState, useEffect } from 'react';
import { sourceService } from '../../services/sourceService';
import { Source, SourceDiscoveryResult, SourceTestPreviewItem } from '../../types';
import {
  Globe, Plus, Play, Pause, Trash2, Edit3, CheckCircle2,
  RefreshCw, ExternalLink, Search, ShieldCheck,
  FileText, AlertCircle, ChevronDown, ChevronUp, X, Sparkles
} from 'lucide-react';

export const SourceManager: React.FC = () => {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'paused'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Add/Edit modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<Source | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [categoryInput, setCategoryInput] = useState<Source['category']>('government');
  const [listingUrlInput, setListingUrlInput] = useState('');
  const [orgInput, setOrgInput] = useState('');
  const [intervalInput, setIntervalInput] = useState(6);
  const [methodInput, setMethodInput] = useState<Source['collection_method']>('html');
  const [itemSelectorInput, setItemSelectorInput] = useState('');
  const [titleSelectorInput, setTitleSelectorInput] = useState('');
  const [linkSelectorInput, setLinkSelectorInput] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Discovery & Test Preview state
  const [discovering, setDiscovering] = useState(false);
  const [discoveryResult, setDiscoveryResult] = useState<SourceDiscoveryResult | null>(null);
  const [discoveryError, setDiscoveryError] = useState<string | null>(null);

  const [testing, setTesting] = useState(false);
  const [testPreviewItems, setTestPreviewItems] = useState<SourceTestPreviewItem[] | null>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  // Run feedback
  const [runningSourceId, setRunningSourceId] = useState<string | null>(null);
  const [runMessage, setRunMessage] = useState<string | null>(null);

  const loadSources = async () => {
    setLoading(true);
    try {
      const data = await sourceService.getSources();
      setSources(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSources();
  }, []);

  const handleOpenAddModal = () => {
    setEditingSource(null);
    setUrlInput('');
    setNameInput('');
    setCategoryInput('government');
    setListingUrlInput('');
    setOrgInput('');
    setIntervalInput(6);
    setMethodInput('html');
    setItemSelectorInput('');
    setTitleSelectorInput('');
    setLinkSelectorInput('');
    setDiscoveryResult(null);
    setDiscoveryError(null);
    setTestPreviewItems(null);
    setShowAdvanced(false);
    setModalOpen(true);
  };

  const handleOpenEditModal = (src: Source) => {
    setEditingSource(src);
    setUrlInput(src.base_url);
    setNameInput(src.name);
    setCategoryInput(src.category);
    setListingUrlInput(src.listing_url);
    setOrgInput(src.organization || '');
    setIntervalInput(src.request_interval_hours);
    setMethodInput(src.collection_method);
    setItemSelectorInput(src.item_selector || '');
    setTitleSelectorInput(src.title_selector || '');
    setLinkSelectorInput(src.link_selector || '');
    setDiscoveryResult(null);
    setDiscoveryError(null);
    setTestPreviewItems(null);
    setShowAdvanced(true);
    setModalOpen(true);
  };

  // Run Layered Discovery on website URL
  const handleDiscoverWebsite = async () => {
    if (!urlInput.trim()) {
      setDiscoveryError('Please enter a website URL first.');
      return;
    }
    setDiscovering(true);
    setDiscoveryError(null);
    try {
      const res = await sourceService.discoverWebsite(urlInput.trim());
      setDiscoveryResult(res);
      if (res.detected_listing_url && !listingUrlInput) {
        setListingUrlInput(res.detected_listing_url);
      }
      if (res.detected_method) {
        setMethodInput(res.detected_method);
      }
      if (res.proposed_selectors) {
        if (res.proposed_selectors.item_selector) setItemSelectorInput(res.proposed_selectors.item_selector);
        if (res.proposed_selectors.title_selector) setTitleSelectorInput(res.proposed_selectors.title_selector);
        if (res.proposed_selectors.link_selector) setLinkSelectorInput(res.proposed_selectors.link_selector);
      }
      if (!nameInput) {
        try {
          const u = new URL(urlInput.trim());
          setNameInput(u.hostname.replace('www.', '').toUpperCase());
        } catch {}
      }
    } catch (err: any) {
      setDiscoveryError(err.message || 'Discovery failed.');
    } finally {
      setDiscovering(false);
    }
  };

  // Run Test Collection and Preview extracted job notices
  const handleTestSource = async () => {
    setTesting(true);
    try {
      const preview = await sourceService.testSourcePreview({
        base_url: urlInput,
        listing_url: listingUrlInput || urlInput,
        name: nameInput || 'New Source',
        category: categoryInput,
        organization: orgInput || nameInput
      });
      setTestPreviewItems(preview);
      setPreviewModalOpen(true);
    } catch (err: any) {
      alert('Test extraction failed: ' + err.message);
    } finally {
      setTesting(false);
    }
  };

  // Save new or edited source
  const handleSaveSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    if (editingSource) {
      await sourceService.updateSource(editingSource.id, {
        name: nameInput,
        base_url: urlInput,
        listing_url: listingUrlInput || urlInput,
        category: categoryInput,
        organization: orgInput,
        request_interval_hours: intervalInput,
        collection_method: methodInput,
        item_selector: itemSelectorInput,
        title_selector: titleSelectorInput,
        link_selector: linkSelectorInput
      });
    } else {
      await sourceService.addSource({
        name: nameInput || new URL(urlInput).hostname,
        base_url: urlInput,
        listing_url: listingUrlInput || urlInput,
        category: categoryInput,
        organization: orgInput || nameInput,
        request_interval_hours: intervalInput,
        collection_method: methodInput,
        item_selector: itemSelectorInput,
        title_selector: titleSelectorInput,
        link_selector: linkSelectorInput
      });
    }

    setModalOpen(false);
    setPreviewModalOpen(false);
    loadSources();
  };

  // Toggle pause/active
  const handleToggleStatus = async (id: string) => {
    await sourceService.toggleSourceStatus(id);
    loadSources();
  };

  // Delete source
  const handleDeleteSource = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete source "${name}"?`)) {
      await sourceService.deleteSource(id);
      loadSources();
    }
  };

  // Trigger manual collection run for single source
  const handleRunSource = async (id: string) => {
    setRunningSourceId(id);
    setRunMessage(null);
    try {
      const run = await sourceService.triggerCollectionRun(id);
      setRunMessage(`Collection Run Complete: Discovered ${run.items_discovered} notices, updated ${run.items_updated}, ${run.duplicates_found} duplicates.`);
      loadSources();
      setTimeout(() => setRunMessage(null), 6000);
    } catch (e: any) {
      alert('Collection failed: ' + e.message);
    } finally {
      setRunningSourceId(null);
    }
  };

  const filteredSources = sources.filter((s) => {
    if (activeTab === 'active' && s.status !== 'active') return false;
    if (activeTab === 'paused' && s.status !== 'paused') return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.base_url.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Action Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Globe className="w-5 h-5 text-blue-900" />
            <h2 className="text-xl font-extrabold text-slate-900">
              Universal Website Source Manager
            </h2>
          </div>
          <p className="text-xs text-slate-500 max-w-xl">
            Dynamically add, discover, test, and manage any job or recruitment website without code modifications. Layered discovery scans robots.txt, sitemaps, RSS feeds, and HTML notices.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => handleRunSource('all')}
            disabled={runningSourceId !== null}
            className="px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${runningSourceId === 'all' ? 'animate-spin' : ''}`} />
            <span>Trigger All Due Sources</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Website</span>
          </button>
        </div>
      </div>

      {/* Run status toast */}
      {runMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{runMessage}</span>
        </div>
      )}

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 bg-slate-200/80 rounded-xl">
          {(['all', 'active', 'paused'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                activeTab === tab
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab} Sources ({sources.filter((s) => tab === 'all' || s.status === tab).length})
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search configured sources..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
          />
        </div>
      </div>

      {/* Sources Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Recruitment Source</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Collection Method</th>
                <th className="py-3 px-4">Health Status</th>
                <th className="py-3 px-4">Schedule / Frequency</th>
                <th className="py-3 px-4">Last Success</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSources.map((src) => {
                const isRunning = runningSourceId === src.id;
                return (
                  <tr key={src.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Source Name & URLs */}
                    <td className="py-3 px-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900">{src.name}</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold uppercase ${
                            src.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {src.status}
                          </span>
                        </div>
                        <a
                          href={src.listing_url || src.base_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-blue-800 hover:underline flex items-center gap-1 truncate max-w-xs"
                        >
                          <span className="truncate">{src.listing_url || src.base_url}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4">
                      <span className="capitalize px-2 py-0.5 rounded font-medium bg-slate-100 text-slate-700">
                        {src.category.replace('_', ' ')}
                      </span>
                    </td>

                    {/* Method */}
                    <td className="py-3 px-4 font-mono uppercase text-[10px] text-slate-600">
                      {src.collection_method}
                    </td>

                    {/* Health */}
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                        Healthy
                      </span>
                    </td>

                    {/* Frequency */}
                    <td className="py-3 px-4 text-slate-600">
                      Every {src.request_interval_hours} hrs
                    </td>

                    {/* Last Success */}
                    <td className="py-3 px-4 text-slate-500 text-[11px]">
                      {src.last_successful_run_at
                        ? new Date(src.last_successful_run_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : 'Pending run'}
                    </td>

                    {/* Action buttons */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleRunSource(src.id)}
                          disabled={isRunning}
                          title="Run immediate extraction check"
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-blue-50 text-blue-900 transition-colors"
                        >
                          <Play className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
                        </button>

                        <button
                          onClick={() => handleToggleStatus(src.id)}
                          title={src.status === 'active' ? 'Pause collector' : 'Resume collector'}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
                        >
                          {src.status === 'active' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          onClick={() => handleOpenEditModal(src)}
                          title="Edit source selectors and rules"
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDeleteSource(src.id, src.name)}
                          title="Delete source"
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-red-50 text-red-600 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Source Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 my-8 overflow-hidden">
            <div className="bg-slate-950 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold">
                  {editingSource ? 'Edit Recruitment Source' : 'Configure New Website Source'}
                </h3>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSource} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Step 1: Website URL & Discovery */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  Website Base URL (Target Authority) *
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    required
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://recruitment.commission.gov.in"
                    className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleDiscoverWebsite}
                    disabled={discovering}
                    className="px-3.5 py-2 rounded-lg bg-blue-900 text-white text-xs font-bold hover:bg-blue-800 flex items-center gap-1.5 shrink-0 transition-colors disabled:opacity-50"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${discovering ? 'animate-spin' : ''}`} />
                    <span>{discovering ? 'Scanning...' : 'Discover Website'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  SSRF protected. Rejects localhost, RFC 1918 private subnets, and AWS/GCP cloud metadata.
                </p>
              </div>

              {/* Discovery Result Feedback Strip */}
              {discoveryError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>{discoveryError}</span>
                </div>
              )}

              {discoveryResult && (
                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Discovery Complete: Page Structure Detected!</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-emerald-800">
                    <div>
                      <span className="font-semibold">Detected Method:</span> {discoveryResult.detected_method.toUpperCase()}
                    </div>
                    <div>
                      <span className="font-semibold">Sample Notices:</span> {discoveryResult.sample_notices_found}
                    </div>
                    <div>
                      <span className="font-semibold">PDF Gazettes:</span> {discoveryResult.sample_pdfs_found}
                    </div>
                    <div>
                      <span className="font-semibold">Robots.txt:</span> {discoveryResult.robots_txt_status}
                    </div>
                  </div>
                  {discoveryResult.detected_listing_url && (
                    <p className="text-[11px] text-emerald-900 truncate">
                      <span className="font-semibold">Detected Listing URL:</span> {discoveryResult.detected_listing_url}
                    </p>
                  )}
                </div>
              )}

              {/* Name & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Source Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="e.g. State Public Service Commission"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Opportunity Category *
                  </label>
                  <select
                    value={categoryInput}
                    onChange={(e) => setCategoryInput(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:outline-none"
                  >
                    <option value="government">Government Recruitment (Sarkari)</option>
                    <option value="private">Private Tech & Core Openings</option>
                    <option value="internship">Internship Programs</option>
                    <option value="employment_portal">Employment Portal / Aggregator</option>
                    <option value="psu">Public Sector Undertaking (PSU)</option>
                    <option value="other">Other Recognized Entity</option>
                  </select>
                </div>
              </div>

              {/* Recruitment Listing URL */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Recruitment / Notices Page URL (Distinct from Homepage)
                </label>
                <input
                  type="url"
                  value={listingUrlInput}
                  onChange={(e) => setListingUrlInput(e.target.value)}
                  placeholder="https://recruitment.commission.gov.in/notices-active"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:outline-none"
                />
              </div>

              {/* Organization & Frequency */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Recruiting Organization Name
                  </label>
                  <input
                    type="text"
                    value={orgInput}
                    onChange={(e) => setOrgInput(e.target.value)}
                    placeholder="e.g. Haryana Staff Selection Commission"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Collection Interval (Hours)
                  </label>
                  <select
                    value={intervalInput}
                    onChange={(e) => setIntervalInput(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:outline-none"
                  >
                    <option value={3}>Every 3 Hours (High Priority)</option>
                    <option value={6}>Every 6 Hours (Standard)</option>
                    <option value={12}>Every 12 Hours</option>
                    <option value={24}>Every 24 Hours (Daily)</option>
                  </select>
                </div>
              </div>

              {/* Collapsible Advanced Selectors */}
              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-xs font-bold text-blue-900 flex items-center gap-1 hover:underline"
                >
                  <span>{showAdvanced ? 'Hide Custom Selectors & CSS Patterns' : 'Configure Custom Selectors & Rules (Optional)'}</span>
                  {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showAdvanced && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-600 mb-1">Item Container CSS</label>
                      <input
                        type="text"
                        value={itemSelectorInput}
                        onChange={(e) => setItemSelectorInput(e.target.value)}
                        placeholder=".notice-item, tr"
                        className="w-full p-2 border border-slate-300 rounded bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-600 mb-1">Title CSS Selector</label>
                      <input
                        type="text"
                        value={titleSelectorInput}
                        onChange={(e) => setTitleSelectorInput(e.target.value)}
                        placeholder="a.notice-title, td.title"
                        className="w-full p-2 border border-slate-300 rounded bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-600 mb-1">Link / PDF Selector</label>
                      <input
                        type="text"
                        value={linkSelectorInput}
                        onChange={(e) => setLinkSelectorInput(e.target.value)}
                        placeholder="a[href$='.pdf']"
                        className="w-full p-2 border border-slate-300 rounded bg-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleTestSource}
                  disabled={testing || !urlInput.trim()}
                  className="px-4 py-2.5 rounded-lg border border-blue-900 text-blue-900 text-xs font-bold hover:bg-blue-50 flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <FileText className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
                  <span>{testing ? 'Testing Extraction...' : 'Test Source & Preview Jobs'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-lg bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold shadow-sm"
                  >
                    {editingSource ? 'Update Source' : 'Save & Enable Source'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Extracted Jobs Modal */}
      {previewModalOpen && testPreviewItems && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 my-8 overflow-hidden">
            <div className="bg-blue-950 p-5 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">Extraction Engine Preview</h3>
                <p className="text-xs text-blue-200">
                  Previewing extracted opportunities for "{nameInput || urlInput}" before enabling
                </p>
              </div>
              <button onClick={() => setPreviewModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                <span>Discovered {testPreviewItems.length} prospective recruitment records.</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Deterministic Rules Verified
                </span>
              </div>

              <div className="space-y-3">
                {testPreviewItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs space-y-2 text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-sm text-slate-900">{item.title}</h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-900 uppercase">
                        {item.category}
                      </span>
                    </div>

                    <p className="text-slate-500 font-medium">{item.organization}</p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-[11px]">
                      <div>
                        <span className="text-slate-400 block">Vacancies:</span>
                        <span className="font-bold text-slate-800">{item.vacancies || 'Not specified'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Deadline:</span>
                        <span className="font-bold text-slate-800">{item.application_deadline || 'Not found'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Qualification:</span>
                        <span className="font-medium text-slate-800 truncate block" title={item.qualification}>{item.qualification}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Confidence:</span>
                        <span className="font-bold text-emerald-600">{Math.round(item.confidence_score * 100)}%</span>
                      </div>
                    </div>

                    {item.warnings && item.warnings.length > 0 && (
                      <div className="p-2 bg-amber-50 rounded border border-amber-200 text-amber-800 text-[11px]">
                        {item.warnings.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPreviewModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Adjust Selectors
                </button>
                <button
                  type="button"
                  onClick={(e) => handleSaveSource(e as any)}
                  className="px-5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold"
                >
                  Confirm & Enable Source
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
