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
}

async function updateIssue(project, issueId, issueProps) {
    if (!project) return { error: 'missing project' };
    if (!issueId) return { error: 'missing _id' };
    if (!issueProps || Object.keys(issueProps).length === 0) 
        return { error: 'no update field(s) sent', _id: issueId };
    
    const now = new Date().toISOString();

    const updateProps = { ...issueProps, 'updated_on': now };
    delete updateProps._id;

    const updatedIssue = await Issue.findByIdAndUpdate(issueId, updateProps, { new: true, useFindAndModify: false }); 
    if (!updatedIssue) return { error: 'could not update', _id: issueId };

    return {  result: 'successfully updated', _id: issueId };
}

module.exports = { 
    createIssue, deleteIssue, deleteIssues, getIssues, updateIssue
};