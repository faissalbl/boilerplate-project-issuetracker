/** 
  This model will hold data only for the duration of the server run.
*/
const project = {
  idSeq: 1,
  projects: {},

  createIssue: function(project, issueProps) {
    const { issue_title, issue_text, created_by, assigned_to = '', open = false, status_text = '' } = (issueProps || {});

    if (!project || !issue_title || !issue_text || !created_by) {
      return { error: 'required field(s) missing' };
    }

    if (!this.projects[project]) this.projects[project] = {};

    let issues = this.projects[project].issues;
    if (!issues) {
      issues = [];
      this.projects[project].issues = issues;
    }

    const now = new Date().toISOString();

    const issue = {
      _id: this.idSeq++,
      issue_title,
      issue_text,
      created_on: now,
      updated_on: now,
      created_by,
      assigned_to,
      open,
      status_text,
    };

    issues.push(issue);

    return issue;
  },

  updateIssue: function(project, issueId, issueProps) {
    if (!project) return { error: 'missing project' };
    if (!issueId) return { error: 'missing _id' };
    if (!issueProps || Object.keys(issueProps).length === 0) 
      return { error: 'no update field(s) sent', _id: issueId };

    const issues = this.projects[project]?.issues;
    if (!issues) return { error: 'issues not found', project };
    
    const issue = issues.find(i => i._id === issueId);
    if (!issue) return { error: 'could not update', _id: issueId };

    const now = new Date().toISOString();

    for (const [key, value] of Object.entries(issueProps)) {
      if (key === '_id') continue; // do not update _id.
      issue[key] = value;
      issue['updated_on'] = now;
    }

    return {  result: 'successfully updated', _id: issue._id };
  },

  getIssues: function(project, filters) {
    const { _id, issue_title, issue_text, created_on, updated_on, created_by, assigned_to, open, status_text } = (filters || {});
    if (!project) throw new Error("project is required");

    let issues = this.projects[project]?.issues || [];
    if (!issues) return issues;

    if (!_id && !issue_title && !issue_text && !created_on && !updated_on && !created_by && !assigned_to && open === undefined && !status_text) {
      return issues;
    }

    return issues.filter(item => {
      return (
        (!_id || item._id == _id) &&
        (!issue_title || item.issue_title === issue_title) &&
        (!issue_text || item.issue_text === issue_text) &&
        (!created_on || item.created_on === created_on) &&
        (!updated_on || item.updated_on === updated_on) &&
        (!created_by || item.created_by === created_by) && 
        (!assigned_to || item.assigned_to === assigned_to) &&
        (open === undefined || item.open == open) &&
        (!status_text || item.status_text === status_text)
      );
    });
  },

  deleteIssue: function(project, issueId) {
    if (!project) return { error: 'missing project' };
    if (!issueId) return { error: 'missing _id' };
    
    const issues = this.projects[project]?.issues;
    if (!issues) return { error: 'issues not found', project };

    const issue = issues.find(i => i._id == issueId);
    if (!issue) return { error: 'could not delete', _id: issueId };

    const index = issues.indexOf(issue);
    issues.splice(index, 1);

    return { result: 'successfully deleted', '_id': issue._id };
  },

  clear: function(project) {
    if (!project) this.projects = {};
    else {
      const project = this.projects[project];
      if (project) {
        project.issues = [];
      }
    }

    this.idSeq = 1;
  },
};

project.createIssue = project.createIssue.bind(project);
project.getIssues = project.getIssues.bind(project);
project.updateIssue = project.updateIssue.bind(project);
project.deleteIssue = project.deleteIssue.bind(project);
project.clear = project.clear.bind(project);

module.exports = project;