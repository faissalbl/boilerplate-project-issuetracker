// const chai = require('chai');
// const assert = chai.assert;
// const { createIssue, getIssues, updateIssue, deleteIssue, clear } = require('../models/project');

// suite('Unit Tests', () => {
//   suite('issues', () => {
//     suite('create issues', () => {
//       test('Create an issue with every field', () => {
//         const projectName = 'testProject';
//         const issue_title = 'Fix error in posting data';
//         const issue_text = 'When we post data it has an error.';
//         const created_by = 'Joe';
//         const assigned_to = 'Joe';
//         const open = true;
//         const status_text = 'In QA';
  
//         const issue = createIssue(projectName, { issue_title, issue_text, created_by, assigned_to, open, status_text });
  
//         assert.equal(issue.issue_title, issue_title);
//         assert.equal(issue.issue_text, issue_text);
//         assert.equal(issue.created_by, created_by);
//         assert.equal(issue.assigned_to, assigned_to);
//         assert.equal(issue.open, open);
//         assert.equal(issue.status_text, status_text);
  
//         assert.isNotNull(issue.created_on);
//         assert.isNotNull(issue.updated_on);
//         assert.isAtMost(new Date(issue.created_on), new Date());
//         assert.isAtMost(new Date(issue.updated_on), new Date());
  
//         assert.equal(issue._id, 1);
//       });
  
//       test('Create an issue with only required fields', () => {
//         const projectName = 'testProject';
//         const issue_title = 'Fix error in posting data';
//         const issue_text = 'When we post data it has an error.';
//         const created_by = 'Joe';
  
//         const issue = createIssue(projectName, { issue_title, issue_text, created_by });
  
//         assert.equal(issue.issue_title, issue_title);
//         assert.equal(issue.issue_text, issue_text);
//         assert.equal(issue.created_by, created_by);
//         assert.equal(issue.assigned_to, '');
//         assert.equal(issue.open, true);
//         assert.equal(issue.status_text, '');
  
//         assert.isNotNull(issue.created_on);
//         assert.isNotNull(issue.updated_on);
//         assert.isAtMost(new Date(issue.created_on), new Date());
//         assert.isAtMost(new Date(issue.updated_on), new Date());
  
//         assert.equal(issue._id, 1);
//       });
  
//       test('Create an issue with missing required fields', () => {
//         const projectName = 'testProject';
//         const error = 'required field(s) missing';
        
//         let issue = createIssue(projectName);
//         assert.equal(issue.error, error);
        
//         issue = createIssue(projectName, {});
//         assert.equal(issue.error, error);
           
//         let issue_title = 'Fix error in posting data';
//         let issue_text = 'When we post data it has an error.';
//         let created_by = undefined;
  
//         issue = createIssue(projectName, { issue_title, issue_text, created_by });
//         assert.equal(issue.error, error);
  
//         issue_title = 'Fix error in posting data';
//         issue_text = undefined;
//         created_by = 'Joe';
  
//         issue = createIssue(projectName, { issue_title, issue_text, created_by });
//         assert.equal(issue.error, error);
  
//         issue_title = undefined;
//         issue_text = 'When we post data it has an error.';
//         created_by = 'Joe';
  
//         issue = createIssue(projectName, { issue_title, issue_text, created_by });
//         assert.equal(issue.error, error);
//       });

//       teardown(() => {
//         clear();
//       });
//     });

//     suite('view issues on a project', () => {

//         suiteSetup(() => {
//           // first 5 items to testProject 1, the other 5 items to testProject 2
//           // multiples of 3 are not open. The others are.
//           // testProject 1 created and assigned to Joe 1. testProject 2: Joe 2.
//           for (let i = 0; i <= 9; i++) {
//             const projectN = i <= 4 ? 1 : 2;
//             const n = i % 5;
//             let projectName = `testProject ${projectN}`;
//             let issue_title = `Fix error in posting data ${n}`;
//             let issue_text = `When we post data it has an error ${n}`;
//             let created_by = `Joe ${projectN}`;
//             let assigned_to = `Joe ${projectN}`;
//             let open = n % 3 == 0 ? false : true;
//             let status_text = `In QA ${n}`;
    
//             createIssue(projectName, { issue_title, issue_text, created_by, assigned_to, open, status_text });
//           }
//         });
        
//         test('View issues on a project', () => {
//           let projectName = 'testProject 1';
//           let joe = 'Joe 1';
//           let issues = getIssues(projectName);
//           assert.equal(issues.length, 5);

//           for (let i = 0; i <= 4; i++) {
//             let issue_title = `Fix error in posting data ${i}`;
//             let issue_text = `When we post data it has an error ${i}`;
//             let created_by = joe;
//             let assigned_to = joe;
//             let open = (i) % 3 == 0 ? false : true;
//             let status_text = `In QA ${i}`;

//             assert.equal(issues[i].issue_title, issue_title);
//             assert.equal(issues[i].issue_text, issue_text);
//             assert.equal(issues[i].created_by, created_by);
//             assert.equal(issues[i].assigned_to, assigned_to);
//             assert.equal(issues[i].open, open);
//             assert.equal(issues[i].status_text, status_text);
//           }

//           projectName = 'testProject 2';
//           joe = 'Joe 2';
//           issues = getIssues(projectName);
//           assert.equal(issues.length, 5);

//           for (let i = 0; i <= 4; i++) {
//             let issue_title = `Fix error in posting data ${i}`;
//             let issue_text = `When we post data it has an error ${i}`;
//             let created_by = joe;
//             let assigned_to = joe;
//             let open = (i) % 3 == 0 ? false : true;
//             let status_text = `In QA ${i}`;
  
//             assert.equal(issues[i].issue_title, issue_title);
//             assert.equal(issues[i].issue_text, issue_text);
//             assert.equal(issues[i].created_by, created_by);
//             assert.equal(issues[i].assigned_to, assigned_to);
//             assert.equal(issues[i].open, open);
//             assert.equal(issues[i].status_text, status_text);
//           }
//         });


//         test('View issues on a project with one filter', () => {
//           let projectName = 'testProject 1';
//           let issues = getIssues(projectName, { _id: 2 });
//           assert.equal(issues.length, 1);

//           issues = getIssues(projectName, { issue_title: 'Fix error in posting data 2'  });
//           assert.equal(issues.length, 1);

//           issues = getIssues(projectName, { created_by: 'Joe 1' });
//           assert.equal(issues.length, 5);
  
//           issues = getIssues(projectName, { created_by: 'Joe 2'});
//           assert.isEmpty(issues);

//           issues = getIssues(projectName, { assigned_to: 'Joe 1' });
//           assert.equal(issues.length, 5);

//           issues = getIssues(projectName, { open: false });
//           assert.equal(issues.length, 2);

//           issues = getIssues(projectName, { status_text: 'In QA 2' });
//           assert.equal(issues.length, 1);
//         });

//         test('View issues on a project with multiple filters', () => {
//           let projectName = 'testProject 1';
//           let issues = getIssues(projectName, { _id: 3, issue_title: 'Fix error in posting data 2', created_by: 'Joe 1' });
//           assert.equal(issues.length, 1);
  
//           issues = getIssues(projectName, { created_by: 'Joe 2', assigned_to: 'Joe 1'});
//           assert.isEmpty(issues);
  
//           issues = getIssues(projectName, { open: false, status_text: 'In QA 3' });
//           assert.equal(issues.length, 1);
//         });

//         suiteTeardown(() => {
//           clear();
//         });
//     });

//     suite('issue update', () => {
//         suiteSetup(() => {
//           // first 5 items to testProject 1, the other 5 items to testProject 2
//           // multiples of 3 are not open. The others are.
//           // testProject 1 created and assigned to Joe 1. testProject 2: Joe 2.
//           for (let i = 0; i <= 9; i++) {
//             const projectN = i <= 4 ? 1 : 2;
//             const n = i % 5;
//             let projectName = `testProject ${projectN}`;
//             let issue_title = `Fix error in posting data ${n}`;
//             let issue_text = `When we post data it has an error ${n}`;
//             let created_by = `Joe ${projectN}`;
//             let assigned_to = `Joe ${projectN}`;
//             let open = n % 3 == 0 ? false : true;
//             let status_text = `In QA ${n}`;

//             createIssue(projectName, { issue_title, issue_text, created_by, assigned_to, open, status_text });
//           }
//         });

//         test('Update issue without project or issue id', () => {
//           let error = 'missing project';
//           let issue = updateIssue(undefined, 1, { issue_title: 'Fix error in posting data' });
//           assert.equal(issue.error, error);

//           error = 'missing _id';
//           issue = updateIssue('testProject 1', undefined, { issue_title: 'Fix error in posting data' });
//           assert.equal(issue.error, error);

//           error = 'no update field(s) sent';
//           issue = updateIssue('testProject 1', 1, );
//           assert.equal(issue.error, error);

//           error = 'no update field(s) sent';
//           issue = updateIssue('testProject 1', 1, {});
//           assert.equal(issue.error, error);
//         });

//         test('Update issue does not find project issues', () => {
//           const error = 'issues not found';
//           const issue = updateIssue('unexisting project', 1, { issue_title: 'Fix error in posting data ABC' });
//           assert.equal(issue.error, error);
//         });

//         test('Update issue does not find issue', () => {
//           const error = 'could not update';
//           const issue = updateIssue('testProject 1', 999, { issue_title: 'Fix error in posting data ABC' });
//           assert.equal(issue.error, error);
//         });;
      
//         test('Update one field on an issue', () => {
//           const msg = 'successfully updated';
//           const id = 1;
//           const result = updateIssue('testProject 1', id, { issue_title: 'Fix error in posting data' });
//           assert.equal(result.result, msg);
//           assert.equal(result._id, id);
//         });
      
//         suiteTeardown(() => {
//           clear();
//         });
//     });

//     suite('delete issue', () => {
//         suiteSetup(() => {
//           // first 5 items to testProject 1, the other 5 items to testProject 2
//           // multiples of 3 are not open. The others are.
//           // testProject 1 created and assigned to Joe 1. testProject 2: Joe 2.
//           for (let i = 0; i <= 9; i++) {
//             const projectN = i <= 4 ? 1 : 2;
//             const n = i % 5;
//             let projectName = `testProject ${projectN}`;
//             let issue_title = `Fix error in posting data ${n}`;
//             let issue_text = `When we post data it has an error ${n}`;
//             let created_by = `Joe ${projectN}`;
//             let assigned_to = `Joe ${projectN}`;
//             let open = n % 3 == 0 ? false : true;
//             let status_text = `In QA ${n}`;

//             createIssue(projectName, { issue_title, issue_text, created_by, assigned_to, open, status_text });
//           }
//         });

//         test('delete issue without project or issue id', () => {
//           let error = 'missing project';
//           let issue = deleteIssue(undefined, 1);
//           assert.equal(issue.error, error);

//           error = 'missing _id';
//           issue = deleteIssue('testProject 1', undefined);
//           assert.equal(issue.error, error);
//         });

//         test('delete issue does not find project issues', () => {
//           const error = 'issues not found';
//           const issue = deleteIssue('unexisting project', 1);
//           assert.equal(issue.error, error);
//         });

//         test('delete issue does not find issue', () => {
//           const error = 'could not delete';
//           const issue = deleteIssue('testProject 1', 999);
//           assert.equal(issue.error, error);
//         });;

//         test('delete issue', () => {
//           const msg = 'successfully deleted';
//           const id = 1;
//           const result = deleteIssue('testProject 1', id);
//           assert.equal(result.result, msg);
//           assert.equal(result._id, id);
//         });

//         suiteTeardown(() => {
//           clear();
//         });
//     });
//   });
// });
