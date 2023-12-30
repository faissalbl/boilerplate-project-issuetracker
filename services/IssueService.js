const Issue = require('../models/Issue');

async function createIssue (project, issueProps) {
    const { issue_title, issue_text, created_by, assigned_to, open, status_text } = (issueProps || {});
  
    if (!project || !issue_title || !issue_text || !created_by) {
      return { error: 'required field(s) missing' };
    }
   
    const issueData = {
      project,
      issue_title,
      issue_text,
      created_by,
      assigned_to,
      open,
      status_text,
    };
  
    let issue = new Issue(issueData);
    issue = await issue.save();
  
    return issue;
}

async function deleteIssue(project, issueId) {
    if (!project) return { error: 'missing project' };
    if (!issueId) return { error: 'missing _id' };

    const { deletedCount } = await Issue.deleteOne({ _id: issueId, project });
    if (deletedCount === 0) return { error: 'could not delete', _id: issueId };

    return { result: 'successfully deleted', '_id': issueId };
}

async function deleteIssues(project) {
    if (!project) return { error: 'missing project' };
  
    const { deletedCount } = await Issue.deleteMany({ project });
    if (deletedCount === 0) return { error: 'could not delete', project };
  
    return { result: 'successfully deleted', project };
}

async function getIssues(project, filters) {
    if (!project) throw new Error("project is required");
  
    const issues = await Issue.find({ project, ...filters });
    return issues;
  
    // return issues.filter(item => {
    //   return (
    //     (!_id || item._id == _id) &&
    //     (!issue_title || item.issue_title === issue_title) &&
    //     (!issue_text || item.issue_text === issue_text) &&
    //     (!created_on || item.created_on === created_on) &&
    //     (!updated_on || item.updated_on === updated_on) &&
    //     (!created_by || item.created_by === created_by) && 
    //     (!assigned_to || item.assigned_to === assigned_to) &&
    //     (open === undefined || item.open == open) &&
    //     (!status_text || item.status_text === status_text)
    //   );
    // });
}

const project = {
  idSeq: 1,
  projects: {},

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

project.updateIssue = project.updateIssue.bind(project);
project.clear = project.clear.bind(project);

module.exports = { 
    createIssue, deleteIssue, deleteIssues, getIssues,
};