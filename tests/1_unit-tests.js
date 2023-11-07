const chai = require('chai');
const assert = chai.assert;
const { createIssue, getIssues, clear } = require('../models/project');

suite('Unit Tests', () => {
  suite('issues', () => {
    setup(() => {
      console.log("setup empty");
    });
    
    test('Create an issue with every field', () => {
      const projectName = 'testProject';
      const issue_title = 'Fix error in posting data';
      const issue_text = 'When we post data it has an error.';
      const created_by = 'Joe';
      const assigned_to = 'Joe';
      const open = true;
      const status_text = 'In QA';

      const issue = createIssue(projectName, { issue_title, issue_text, created_by, assigned_to, open, status_text });

      assert.equal(issue.issue_title, issue_title);
      assert.equal(issue.issue_text, issue_text);
      assert.equal(issue.created_by, created_by);
      assert.equal(issue.assigned_to, assigned_to);
      assert.equal(issue.open, open);
      assert.equal(issue.status_text, status_text);

      assert.isNotNull(issue.created_on);
      assert.isNotNull(issue.updated_on);
      assert.isAtMost(new Date(issue.created_on), new Date());
      assert.isAtMost(new Date(issue.updated_on), new Date());

      assert.equal(issue._id, 1);
    });

    test('Create an issue with only required fields', () => {
      const projectName = 'testProject';
      const issue_title = 'Fix error in posting data';
      const issue_text = 'When we post data it has an error.';
      const created_by = 'Joe';

      const issue = createIssue(projectName, { issue_title, issue_text, created_by });

      assert.equal(issue.issue_title, issue_title);
      assert.equal(issue.issue_text, issue_text);
      assert.equal(issue.created_by, created_by);
      assert.equal(issue.assigned_to, '');
      assert.equal(issue.open, false);
      assert.equal(issue.status_text, '');

      assert.isNotNull(issue.created_on);
      assert.isNotNull(issue.updated_on);
      assert.isAtMost(new Date(issue.created_on), new Date());
      assert.isAtMost(new Date(issue.updated_on), new Date());

      assert.equal(issue._id, 1);
    });

    test('Create an issue with missing required fields', () => {
      const projectName = 'testProject';
      const error = 'required field(s) missing';
      
      let issue = createIssue(projectName);
      assert.equal(issue.error, error);
      
      issue = createIssue(projectName, {});
      assert.equal(issue.error, error);
         
      let issue_title = 'Fix error in posting data';
      let issue_text = 'When we post data it has an error.';
      let created_by = undefined;

      issue = createIssue(projectName, { issue_title, issue_text, created_by });
      assert.equal(issue.error, error);

      issue_title = 'Fix error in posting data';
      issue_text = undefined;
      created_by = 'Joe';

      issue = createIssue(projectName, { issue_title, issue_text, created_by });
      assert.equal(issue.error, error);

      issue_title = undefined;
      issue_text = 'When we post data it has an error.';
      created_by = 'Joe';

      issue = createIssue(projectName, { issue_title, issue_text, created_by });
      assert.equal(issue.error, error);
    });

    teardown(() => {
      console.log("teardown");
      clear();
    });
  });
});

/*
{ 
  "_id": "5871dda29faedc3491ff93bb",
  "issue_title": "Fix error in posting data",
  "issue_text": "When we post data it has an error.",
  "created_on": "2017-01-08T06:35:14.240Z",
  "updated_on": "2017-01-08T06:35:14.240Z",
  "created_by": "Joe",
  "assigned_to": "Joe",
  "open": true,
  "status_text": "In QA"
},
*/