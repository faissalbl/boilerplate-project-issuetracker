'use strict';
const { createIssue, getIssues, updateIssue, deleteIssue } = require('../services/IssueService');

module.exports = function (app) {

  app.route('/api/issues/:project')

      .get(async function (req, res) {
          const project = req.params.project;
          const issues = await getIssues(project, req.query);
          return res.json(issues);
      })

      .post(async function (req, res) {
          const project = req.params.project;
          const issue = await createIssue(project, req.body);
          return res.json(issue);
      })
  
      .put(async function (req, res) {
          const project = req.params.project;
          const updateFields = req.body;
          const _id = updateFields._id;

          if (!_id) return res.json({ error: 'missing _id' });
          if (!updateFields || Object.keys(updateFields).length <= 1) 
              return res.json({ error: 'no update field(s) sent', _id: _id });
        
          const result = await updateIssue(project, _id, updateFields);
          return res.json(result);
      })
  
      .delete(async function (req, res) {
          const project = req.params.project;
          const _id = req.query._id;
          if (!_id) return res.json({ error: 'missing _id' });
          const result = await deleteIssue(project, _id);
          return res.json(result);
      });

};
