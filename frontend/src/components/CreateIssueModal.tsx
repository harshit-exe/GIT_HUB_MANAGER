import React, { useState } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Input, Textarea, Select } from './ui/Input';
import { issueApi } from '../services/api';
import {
  Repository,
  Contributor,
  IssueType,
  Priority,
  CreateIssueRequest
} from '../types';

interface CreateIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  repository: Repository;
  contributors: Contributor[];
  onIssueCreated: () => void;
}

interface FormData {
  title: string;
  description: string;
  type: IssueType;
  priority: Priority;
  reporterId: string;
  assigneeIds: string[];
  estimatedHours: string;
  actualHours: string;
  dueDate: string;
  labels: string;
  epicId: string;
  parentId: string;
}

export default function CreateIssueModal({
  isOpen,
  onClose,
  repository,
  contributors,
  onIssueCreated,
}: CreateIssueModalProps) {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    type: IssueType.TASK,
    priority: Priority.MEDIUM,
    reporterId: contributors[0]?.login || '',
    assigneeIds: [],
    estimatedHours: '',
    actualHours: '',
    dueDate: '',
    labels: '',
    epicId: '',
    parentId: '',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.reporterId) {
      newErrors.reporterId = 'Reporter is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const issueData: CreateIssueRequest = {
        projectId: `${repository.owner.login}/${repository.name}`,
        title: formData.title,
        description: formData.description || undefined,
        type: formData.type,
        priority: formData.priority,
        reporterId: formData.reporterId,
        assigneeIds: formData.assigneeIds.length > 0 ? formData.assigneeIds : undefined,
        estimatedHours: formData.estimatedHours ? parseInt(formData.estimatedHours) : undefined,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
        labels: formData.labels ? formData.labels.split(',').map(l => l.trim()).filter(Boolean) : undefined,
        epicId: formData.epicId || undefined,
        parentId: formData.parentId || undefined,
      };

      const result = await issueApi.createIssue(issueData);

      const message = `Issue created successfully!\n\n` +
        `Issue: ${result.issue.title}\n` +
        `Branch: ${result.branch.name}\n` +
        `${result.pullRequest ? `PR: #${result.pullRequest.number}` : 'PR: Will be created when you push code'}\n\n` +
        `${result.notes || 'All components created successfully!'}`;

      alert(message);

      onIssueCreated();
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error creating issue:', error);
      alert('Failed to create issue. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: IssueType.TASK,
      priority: Priority.MEDIUM,
      reporterId: contributors[0]?.login || '',
      assigneeIds: [],
      estimatedHours: '',
      actualHours: '',
      dueDate: '',
      labels: '',
      epicId: '',
      parentId: '',
    });
    setErrors({});
  };

  const handleAssigneeChange = (contributorLogin: string) => {
    setFormData(prev => ({
      ...prev,
      assigneeIds: prev.assigneeIds.includes(contributorLogin)
        ? prev.assigneeIds.filter(id => id !== contributorLogin)
        : [...prev.assigneeIds, contributorLogin]
    }));
  };

  const generateBranchPreview = () => {
    const sanitizedTitle = formData.title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 30);

    const prefix = {
      [IssueType.FEATURE]: 'feature',
      [IssueType.BUG]: 'hotfix',
      [IssueType.TASK]: 'task',
      [IssueType.EPIC]: 'epic',
    };

    const baseName = sanitizedTitle || 'new_issue';
    return `${prefix[formData.type]}/${baseName}`;
  };

  const issueTypeOptions = [
    { value: IssueType.TASK, label: 'Task' },
    { value: IssueType.FEATURE, label: 'Feature' },
    { value: IssueType.BUG, label: 'Bug/Hotfix' },
    { value: IssueType.EPIC, label: 'Epic' },
  ];

  const priorityOptions = [
    { value: Priority.LOW, label: 'Low' },
    { value: Priority.MEDIUM, label: 'Medium' },
    { value: Priority.HIGH, label: 'High' },
    { value: Priority.CRITICAL, label: 'Critical' },
  ];

  const reporterOptions = contributors.map(contributor => ({
    value: contributor.login,
    label: contributor.login,
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Issue"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Input
              label="Issue Title *"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Brief description of the issue"
              error={errors.title}
            />
          </div>

          <Select
            label="Issue Type *"
            value={formData.type}
            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as IssueType }))}
            options={issueTypeOptions}
          />

          <Select
            label="Priority *"
            value={formData.priority}
            onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as Priority }))}
            options={priorityOptions}
          />

          <Select
            label="Reporter *"
            value={formData.reporterId}
            onChange={(e) => setFormData(prev => ({ ...prev, reporterId: e.target.value }))}
            options={reporterOptions}
            error={errors.reporterId}
          />

          <Input
            label="Estimated Hours"
            type="number"
            value={formData.estimatedHours}
            onChange={(e) => setFormData(prev => ({ ...prev, estimatedHours: e.target.value }))}
            placeholder="0"
            min="0"
          />

          <Input
            label="Actual Hours"
            type="number"
            value={formData.actualHours}
            onChange={(e) => setFormData(prev => ({ ...prev, actualHours: e.target.value }))}
            placeholder="0"
            min="0"
          />

          <Input
            label="Due Date"
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
          />

          <Input
            label="Epic ID"
            value={formData.epicId}
            onChange={(e) => setFormData(prev => ({ ...prev, epicId: e.target.value }))}
            placeholder="EPIC-123"
          />

          <Input
            label="Parent Issue ID"
            value={formData.parentId}
            onChange={(e) => setFormData(prev => ({ ...prev, parentId: e.target.value }))}
            placeholder="TASK-456 (for subtasks)"
          />

          <Input
            label="Labels"
            value={formData.labels}
            onChange={(e) => setFormData(prev => ({ ...prev, labels: e.target.value }))}
            placeholder="bug, feature, urgent (comma-separated)"
          />
        </div>

        <div className="md:col-span-2">
          <Textarea
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Detailed description of the issue..."
            rows={4}
          />
        </div>

        {contributors.length > 0 && (
          <div>
            <label className="form-label mb-2">Assignees (Select multiple contributors)</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto border rounded-lg p-3">
              {contributors.map((contributor) => (
                <label
                  key={contributor.id}
                  className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                >
                  <input
                    type="checkbox"
                    checked={formData.assigneeIds.includes(contributor.login)}
                    onChange={() => handleAssigneeChange(contributor.login)}
                    className="rounded border-gray-300"
                  />
                  <img
                    src={contributor.avatar_url}
                    alt={contributor.login}
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="text-sm truncate">{contributor.login}</span>
                </label>
              ))}
            </div>
            {formData.assigneeIds.length > 0 && (
              <p className="text-sm text-gray-600 mt-2">
                Selected: {formData.assigneeIds.join(', ')}
              </p>
            )}
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">What will be created:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• GitHub Issue with your specifications</li>
            <li>• New branch: <code className="bg-blue-100 px-1 rounded">
              {generateBranchPreview()}
            </code> <span className="text-xs">(unique timestamp added if exists)</span></li>
            <li>• Initial commit with issue tracker file (ISSUE_{repository.name.toUpperCase().substring(0, 4)}-XXX.md)</li>
            <li>• Draft Pull Request linked to the issue</li>
            <li>• Issue key assignment (e.g., {repository.name.toUpperCase().substring(0, 4)}-123)</li>
            <li>• Assignees: {formData.assigneeIds.length > 0 ? formData.assigneeIds.join(', ') : 'Reporter only'}</li>
            <li>• Base branch: main/master (auto-detected)</li>
          </ul>
          <div className="mt-3 p-2 bg-blue-100 rounded text-xs text-blue-700">
            <strong>Note:</strong> An initial commit will be created with an issue tracker file to enable PR creation.
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="success"
            loading={loading}
          >
            Create Issue & Branch
          </Button>
        </div>
      </form>
    </Modal>
  );
}