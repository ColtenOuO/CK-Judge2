import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Save, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import client from '../api/client';

const CreateProblem: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

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
    const [mainFile, setMainFile] = useState<File | null>(null);
    const [headerFile, setHeaderFile] = useState<File | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked :
                type === 'number' ? parseInt(value) : value
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'main' | 'header') => {
        if (e.target.files && e.target.files[0]) {
            if (type === 'main') setMainFile(e.target.files[0]);
            else setHeaderFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const data = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                data.append(key, value.toString());
            });
            if (mainFile) {
                data.append('main_file', mainFile);
            }
            if (headerFile) {
                data.append('header_file', headerFile);
            }

            const res = await client.post('/problems/', data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setSuccess('Problem created successfully! Redirecting to setup...');
            setTimeout(() => navigate(`/admin/problems/${res.data.id}/edit`), 1500);
        } catch (err: any) {
            console.error("Create Problem Error:", err);
            setError(err.response?.data?.detail || 'Failed to create problem');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white p-8">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </button>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-8"
                >
                    <h1 className="text-2xl font-bold mb-6 text-cyan-400">Create New Problem</h1>

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

                    <form onSubmit={handleSubmit} className="space-y-6">
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

                                {formData.is_partial && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="mt-6 pt-6 border-t border-slate-800"
                                    >
                                        <label className="block text-sm font-medium text-slate-400 mb-2">Reference main.cpp</label>
                                        <input
                                            type="file"
                                            accept=".cpp,.h"
                                            onChange={(e) => handleFileChange(e, 'main')}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                                            required={formData.is_partial}
                                        />
                                        <p className="mt-2 text-xs text-slate-500 italic">This file will be used to compile with student's code and provided to them for reference.</p>

                                        <div className="mt-4">
                                            <label className="block text-sm font-medium text-slate-400 mb-2">Problem Header (problem.h)</label>
                                            <input
                                                type="file"
                                                accept=".h,.hpp"
                                                onChange={(e) => handleFileChange(e, 'header')}
                                                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                                            />
                                            <p className="mt-2 text-xs text-slate-500 italic">Optional header file for function definition.</p>
                                        </div>
                                    </motion.div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Input Description</label>
                                <textarea
                                    name="input_description"
                                    value={formData.input_description}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Output Description</label>
                                <textarea
                                    name="output_description"
                                    value={formData.output_description}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Time Limit (ms)</label>
                                <input
                                    type="number"
                                    name="time_limit"
                                    value={formData.time_limit}
                                    onChange={handleChange}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Memory Limit (MB)</label>
                                <input
                                    type="number"
                                    name="memory_limit"
                                    value={formData.memory_limit}
                                    onChange={handleChange}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                                />
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
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        Create Problem
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default CreateProblem;
