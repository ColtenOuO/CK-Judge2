import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Plus, FileText, Database, AlertCircle, CheckCircle } from 'lucide-react';
import client from '../api/client';

const ProblemManagement: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'details' | 'testcases'>('details');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Problem Data State
    const [problem, setProblem] = useState<any>(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        input_description: '',
        output_description: '',
        hint: '',
        time_limit: 1000,
        memory_limit: 256,
        difficulty: 'Easy',
        is_active: true,
        is_special_judge: false,
        is_partial: false,
        tags: ''
    });

    // Test Cases State
    const [testCases, setTestCases] = useState<any[]>([]);
    const [inputFile, setInputFile] = useState<File | null>(null);
    const [outputFile, setOutputFile] = useState<File | null>(null);
    const [isSample, setIsSample] = useState(false);
    const [mainFile, setMainFile] = useState<File | null>(null);
    const [headerFile, setHeaderFile] = useState<File | null>(null);

    useEffect(() => {
        fetchProblemData();
        fetchTestCases();
    }, [id]);

    const fetchProblemData = async () => {
        try {
            const res = await client.get(`/problems/${id}`);
            setProblem(res.data);
            setFormData({
                title: res.data.title,
                description: res.data.description,
                input_description: res.data.input_description || '',
                output_description: res.data.output_description || '',
                hint: res.data.hint || '',
                time_limit: res.data.time_limit,
                memory_limit: res.data.memory_limit,
                difficulty: res.data.difficulty,
                is_active: res.data.is_active,
                is_special_judge: res.data.is_special_judge,
                is_partial: res.data.is_partial || false,
                tags: res.data.tags ? res.data.tags.map((t: any) => t.name).join(', ') : ''
            });
            setLoading(false);
        } catch (err) {
            console.error(err);
            setError("Failed to load problem data");
            setLoading(false);
        }
    };

    const fetchTestCases = async () => {
        try {
            const res = await client.get(`/problems/${id}/test_cases`);
            setTestCases(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpdateProblem = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            const data = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                    data.append(key, value.toString());
                }
            });
            if (mainFile) {
                data.append('main_file', mainFile);
            }
            if (headerFile) {
                data.append('header_file', headerFile);
            }
            await client.put(`/problems/${id}`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setSuccess("Problem updated successfully");
            // Redirect after short delay
            setTimeout(() => navigate('/problems'), 1000);
        } catch (err: any) {
            setError(err.response?.data?.detail || "Update failed");
        }
    };

    const handleAddTestCase = async () => {
        if (!inputFile || !outputFile) {
            setError("Both Input and Output files are required");
            return;
        }
        try {
            const data = new FormData();
            data.append('input_file', inputFile);
            data.append('output_file', outputFile);
            data.append('is_sample', isSample.toString());

            await client.post(`/problems/${id}/test_cases`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setInputFile(null);
            setOutputFile(null);
            setIsSample(false);

            // Clear file inputs
            const inputs = document.querySelectorAll('input[type="file"]');
            inputs.forEach((input: any) => input.value = '');

            fetchTestCases();
            setSuccess("Test case added successfully");
        } catch (err: any) {
            console.error("Add test case error:", err);
            setError(err.response?.data?.detail || "Failed to add test case");
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked :
                type === 'number' ? parseInt(value) : value
        }));
    };

    if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading...</div>;

    return (
        <div className="min-h-screen bg-slate-950 text-white p-8">
            <div className="max-w-6xl mx-auto">
                <button
                    onClick={() => navigate('/problems')}
                    className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Problems
                </button>

                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Problem Management</h1>
                        <p className="text-slate-400">Editing: <span className="text-cyan-400">{problem?.title}</span></p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mb-8 border-b border-slate-800">
                    <button
                        onClick={() => setActiveTab('details')}
                        className={`pb-4 px-2 flex items-center gap-2 font-medium transition-colors relative ${activeTab === 'details' ? 'text-cyan-400' : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        <FileText className="w-4 h-4" />
                        Details
                        {activeTab === 'details' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('testcases')}
                        className={`pb-4 px-2 flex items-center gap-2 font-medium transition-colors relative ${activeTab === 'testcases' ? 'text-cyan-400' : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        <Database className="w-4 h-4" />
                        Test Cases ({testCases.length})
                        {activeTab === 'testcases' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400" />}
                    </button>
                </div>

                {/* Feedback */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg mb-6 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        {error}
                    </div>
                )}
                {success && (
                    <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-lg mb-6 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        {success}
                    </div>
                )}

                {/* Content */}
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    {activeTab === 'details' ? (
                        <form onSubmit={handleUpdateProblem} className="bg-slate-900 border border-slate-800 rounded-xl p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                                        required
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Tags</label>
                                    <input
                                        type="text"
                                        name="tags"
                                        value={formData.tags}
                                        onChange={handleChange}
                                        placeholder="e.g. DP, Graph, Math (comma separated)"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows={5}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                                        required
                                    />
                                </div>

                                <div className="col-span-2 p-4 bg-slate-950/50 rounded-xl border border-slate-800">
                                    <label className="block text-sm font-medium text-slate-400 mb-4">Problem Type</label>
                                    <div className="flex gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, is_partial: false })}
                                            className={`flex-1 p-4 rounded-lg border transition-all flex flex-col items-center gap-2 ${!formData.is_partial ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' : 'bg-slate-900 border-slate-800 text-slate-500 grayscale'}`}
                                        >
                                            <div className="font-bold">Standard</div>
                                            <div className="text-xs text-center opacity-70">Students submit full source code</div>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, is_partial: true })}
                                            className={`flex-1 p-4 rounded-lg border transition-all flex flex-col items-center gap-2 ${formData.is_partial ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' : 'bg-slate-900 border-slate-800 text-slate-500 grayscale'}`}
                                        >
                                            <div className="font-bold">Function Completion</div>
                                            <div className="text-xs text-center opacity-70">Students only implement specified functions</div>
                                        </button>
                                    </div>

                                    {(formData.is_partial || problem?.is_partial) && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: (formData.is_partial) ? 1 : 0, height: (formData.is_partial) ? 'auto' : 0 }}
                                            className="mt-6 pt-6 border-t border-slate-800 overflow-hidden"
                                        >
                                            <label className="block text-sm font-medium text-slate-400 mb-2">
                                                {problem?.main_code ? 'Replace main.cpp' : 'Upload main.cpp'}
                                            </label>
                                            <input
                                                type="file"
                                                accept=".cpp,.h"
                                                onChange={(e) => setMainFile(e.target.files?.[0] || null)}
                                                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                                            />
                                            {problem?.main_code && !mainFile && (
                                                <p className="mt-2 text-xs text-emerald-500">✓ main.cpp is currently stored.</p>
                                            )}

                                            <div className="mt-4">
                                                <label className="block text-sm font-medium text-slate-400 mb-2">
                                                    {problem?.header_code ? 'Replace problem.h' : 'Upload problem.h'}
                                                </label>
                                                <input
                                                    type="file"
                                                    accept=".h,.hpp"
                                                    onChange={(e) => setHeaderFile(e.target.files?.[0] || null)}
                                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                                                />
                                                {problem?.header_code && !headerFile && (
                                                    <p className="mt-2 text-xs text-emerald-500">✓ problem.h is currently stored.</p>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </div>


                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Input Description</label>
                                    <textarea name="input_description" value={formData.input_description} onChange={handleChange} rows={3} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-none focus:border-cyan-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Output Description</label>
                                    <textarea name="output_description" value={formData.output_description} onChange={handleChange} rows={3} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-none focus:border-cyan-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Time Limit (ms)</label>
                                    <input type="number" name="time_limit" value={formData.time_limit} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-none focus:border-cyan-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Memory Limit (MB)</label>
                                    <input type="number" name="memory_limit" value={formData.memory_limit} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-none focus:border-cyan-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Difficulty</label>
                                    <select
                                        name="difficulty"
                                        value={formData.difficulty}
                                        onChange={handleChange}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                                    >
                                        <option value="Easy">Easy</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Hard">Hard</option>
                                    </select>
                                </div>
                                <div className="flex items-center gap-6 mt-6">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="is_active"
                                            checked={formData.is_active}
                                            onChange={handleChange}
                                            className="w-4 h-4 rounded border-slate-700 text-cyan-500 focus:ring-offset-0 focus:ring-cyan-500 bg-slate-900"
                                        />
                                        <span className="text-sm text-slate-300">Active</span>
                                    </label>

                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="is_special_judge"
                                            checked={formData.is_special_judge}
                                            onChange={handleChange}
                                            className="w-4 h-4 rounded border-slate-700 text-cyan-500 focus:ring-offset-0 focus:ring-cyan-500 bg-slate-900"
                                        />
                                        <span className="text-sm text-slate-300">Special Judge</span>
                                    </label>
                                </div>
                            </div>
                            <div className="pt-6 border-t border-slate-800 flex justify-end">
                                <button type="submit" className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2">
                                    <Save className="w-5 h-5" />
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-8">
                            {/* Add Test Case Form */}
                            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8">
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <Plus className="w-5 h-5 text-cyan-400" />
                                    Add New Test Case (Upload Files)
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-2">Input File (.in or .txt)</label>
                                        <input
                                            type="file"
                                            onChange={(e) => setInputFile(e.target.files?.[0] || null)}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-none focus:border-cyan-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-2">Output File (.out or .txt)</label>
                                        <input
                                            type="file"
                                            onChange={(e) => setOutputFile(e.target.files?.[0] || null)}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-none focus:border-cyan-500"
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={isSample}
                                            onChange={(e) => setIsSample(e.target.checked)}
                                            className="w-4 h-4 rounded border-slate-700 text-cyan-500 focus:ring-offset-0 focus:ring-cyan-500 bg-slate-900"
                                        />
                                        <span className="text-sm text-slate-300">Is Sample (Visible in problem description)</span>
                                    </label>
                                    <button
                                        onClick={handleAddTestCase}
                                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-lg font-bold shadow-lg shadow-emerald-500/10 transition-all active:scale-95"
                                    >
                                        Upload Test Case
                                    </button>
                                </div>
                                <p className="mt-4 text-xs text-slate-500 italic">
                                    Windows line endings (\r\n) will be automatically converted to Linux format (\n).
                                </p>
                            </div>

                            {/* Test Case List */}
                            <div className="space-y-4">
                                {testCases.map((tc) => (
                                    <div key={tc.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex justify-between items-start">
                                        <div className="grid grid-cols-2 gap-8 flex-1 mr-8">
                                            <div>
                                                <div className="text-xs font-bold text-slate-500 uppercase mb-1">Input</div>
                                                <pre className="bg-slate-950 p-3 rounded-lg text-slate-300 text-xs font-mono overflow-x-auto whitespace-pre-wrap max-h-32">
                                                    {tc.input_data}
                                                </pre>
                                            </div>
                                            <div>
                                                <div className="text-xs font-bold text-slate-500 uppercase mb-1">Output</div>
                                                <pre className="bg-slate-950 p-3 rounded-lg text-slate-300 text-xs font-mono overflow-x-auto whitespace-pre-wrap max-h-32">
                                                    {tc.output_data}
                                                </pre>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            {tc.is_sample && (
                                                <span className="bg-blue-500/10 text-blue-400 text-xs font-bold px-2 py-1 rounded border border-blue-500/20">
                                                    SAMPLE
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {testCases.length === 0 && (
                                    <div className="text-center text-slate-500 py-8">
                                        No test cases found. Add one above.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default ProblemManagement;
