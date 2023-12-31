const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const { createIssue, deleteIssues, getIssues } = require('../services/IssueService');
const mongoose = require('mongoose');

chai.use(chaiHttp);

const http_post = 'post';
const http_get = 'get';
const http_put = 'put';
const http_delete = 'delete';

suite('Functional Tests', function() {

    function sendReqAndTest (url, testFn, http_verb = http_get, body = null) {
        let req = chai.request(server).keepOpen();

        if (http_post === http_verb || http_put === http_verb) {
            if (http_post === http_verb) {
                req = req.post(url);
            } else {
                req = req.put(url);
            }
            if (body) {
                req = req.send(body);
            }
        } else if (http_delete === http_verb) {
            req = req.delete(url);
        } else {
            req = req.get(url);
        }

        req.end((err, res) => {
            testFn(err, res);
        });
    }

    suite('create issue', () => {
        test('Create an issue with every field', (done) => {
            const issue = {
                issue_title: 'my test issue 1',
                issue_text: 'this is my test issue 1',
                created_by: 'Faissal',
                assigned_to: 'John Doe',
                open: true,
                status_text: 'this is in progress',
            };
    
            sendReqAndTest('/api/issues/mytestproject', (err, res) => {
                const { _id, issue_title, issue_text, created_on, updated_on, created_by, assigned_to, open, status_text } = res.body;
                assert.isNotNull(_id);
                assert.equal(issue_title, issue.issue_title);
                assert.equal(issue_text, issue.issue_text);
                assert.isNotNull(created_on);
                assert.isNotNull(updated_on);
                assert.equal(created_by, issue.created_by);
                assert.equal(assigned_to, issue.assigned_to);
                assert.equal(open, issue.open);
                assert.equal(status_text, issue.status_text);
                done();
            }, http_post, issue);
        });
    
        test('Create an issue with only required fields', (done) => {
            const issue = {
                issue_title: 'my test issue 1',
                issue_text: 'this is my test issue 1',
                created_by: 'Faissal',
            };
    
            sendReqAndTest('/api/issues/mytestproject', (err, res) => {
                const { _id, issue_title, issue_text, created_on, updated_on, created_by, assigned_to, open, status_text } = res.body;
                assert.isNotNull(_id);
                assert.equal(issue_title, issue.issue_title);
                assert.equal(issue_text, issue.issue_text);
                assert.isNotNull(created_on);
                assert.isNotNull(updated_on);
                assert.equal(created_by, issue.created_by);
                assert.equal(assigned_to, '');
                assert.isTrue(open);
                assert.equal(status_text, '');
                done();
            }, http_post, issue);
        });
    
        test('Create an issue with missing required fields', (done) => {
            const expectedError = 'required field(s) missing';
            let done1 = false;
            let done2 = false;
            let done3 = false;
            let done4 = false;
            let done5 = false;
            let done6 = false;

            function checkDone() {
              if (done1 && done2 && done3 && done4 && done5 && done6) {
                  done();
              };
            }

            sendReqAndTest('/api/issues/mytestproject', (err, res) => {
                const { error } = res.body;
                assert.equal(error, expectedError);
                done1 = true;
                checkDone();
            }, http_post);
    
            let issue = {
                issue_title: 'my test issue 1',
                issue_text: 'this is my test issue 1',
            };

            sendReqAndTest('/api/issues/mytestproject', (err, res) => {
                const { error } = res.body;
                assert.equal(error, expectedError);
                done2 = true;
                checkDone();
            }, http_post, issue);
    
            issue = {
                issue_title: 'my test issue 1',
                created_by: 'Faissal',
            };

            sendReqAndTest('/api/issues/mytestproject', (err, res) => {
                const { error } = res.body;
                assert.equal(error, expectedError);
                done3 = true;
                checkDone();
            }, http_post, issue);
    
            issue = {
                issue_text: 'this is my test issue 1',
                created_by: 'Faissal',
            };

            sendReqAndTest('/api/issues/mytestproject', (err, res) => {
                const { error } = res.body;
                assert.equal(error, expectedError);
                done4 = true;
                checkDone();
            }, http_post, issue);
    
            issue = {};

            sendReqAndTest('/api/issues/mytestproject', (err, res) => {
                const { error } = res.body;
                assert.equal(error, expectedError);
                done5 = true;
                checkDone();
            }, http_post, issue);

            issue = null;

            sendReqAndTest('/api/issues/mytestproject', (err, res) => {
                const { error } = res.body;
                assert.equal(error, expectedError);
                done6 = true;
                checkDone();
            }, http_post, issue);
        });

        teardown(async () => {
            await deleteIssues('mytestproject');
        });
    });
  
    suite('view issues on a project', () => {

        suiteSetup(async () => {
            await deleteIssues('testProject 1');
            await deleteIssues('testProject 2');

            // first 5 items to testProject 1, the other 5 items to testProject 2
            // multiples of 3 are not open. The others are.
            // testProject 1 created and assigned to Joe 1. testProject 2: Joe 2.
            for (let i = 0; i <= 9; i++) {
                const projectN = i <= 4 ? 1 : 2;
                const n = i % 5;
                let projectName = `testProject ${projectN}`;
                let issue_title = `Fix error in posting data ${n}`;
                let issue_text = `When we post data it has an error ${n}`;
                let created_by = `Joe ${projectN}`;
                let assigned_to = `Joe ${projectN}`;
                let open = n % 3 == 0 ? false : true;
                let status_text = `In QA ${n}`;
      
                await createIssue(projectName, { issue_title, issue_text, created_by, assigned_to, open, status_text });
            }
        });
  
      
        test('View issues on a project', (done) => {
            const testProject1 = 'testProject 1';
            const testProject2 = 'testProject 2';
          
            doneFlags = {
                'testProject 1': [],
                'testProject 2': [],
            };

            function checkDone(length) {
                return doneFlags[testProject1].length === length 
                    && doneFlags[testProject2].length === length;
            }
          
            [
                {proj: testProject1, joe: 'Joe 1'}, 
                {proj: testProject2, joe: 'Joe 2'}
            ].forEach((item, index) => {  
                sendReqAndTest(`/api/issues/${item.proj}`, (err, res) => {
                    const { error } = res.body;
                    assert.isUndefined(error);
                    const issues = res.body;
                    assert.isDefined(issues);
                    assert.equal(issues.length, 5);
                    let joe = item.joe;
    
                    for (let i = 0; i <= 4; i++) {
                        let issue_title = `Fix error in posting data ${i}`;
                        let issue_text = `When we post data it has an error ${i}`;
                        let created_by = joe;
                        let assigned_to = joe;
                        let open = (i) % 3 == 0 ? false : true;
                        let status_text = `In QA ${i}`;
        
                        assert.equal(issues[i].issue_title, issue_title);
                        assert.equal(issues[i].issue_text, issue_text);
                        assert.equal(issues[i].created_by, created_by);
                        assert.equal(issues[i].assigned_to, assigned_to);
                        assert.equal(issues[i].open, open);
                        assert.equal(issues[i].status_text, status_text);
                        doneFlags[item.proj][i] = true;
                    }

                    if (checkDone(5)) done();                    
               });
            });
        });

        test('View issues on a project with one filter', (done) => {
            let projectName = 'testProject 1';

            let done1 = false,
                  done2 = false,
                  done3 = false,
                  done4 = false,
                  done5 = false,
                  done6 = false;

            function checkDone() {
                if (done1 && done2 && done3 && done4 && done5 && done6) done();
            }

            sendReqAndTest(`/api/issues/${projectName}?issue_title=Fix%20error%20in%20posting%20data%202`, (err, res) => {
                const { error } = res.body;
                assert.isUndefined(error);
                const issues = res.body;
                assert.isDefined(issues);
                assert.equal(issues.length, 1);
                done1 = true;
                checkDone();
            });
            
            sendReqAndTest(`/api/issues/${projectName}?created_by=Joe%201`, (err, res) => {
                const { error } = res.body;
                assert.isUndefined(error);
                const issues = res.body;
                assert.isDefined(issues);
                assert.equal(issues.length, 5);
                done2 = true;
                checkDone();
            });

            sendReqAndTest(`/api/issues/${projectName}?created_by=Joe%202`, (err, res) => {
                const { error } = res.body;
                assert.isUndefined(error);
                const issues = res.body;
                assert.isDefined(issues);
                assert.isEmpty(issues);
                done3 = true;
                checkDone();
            });
            
            sendReqAndTest(`/api/issues/${projectName}?assigned_to=Joe%201`, (err, res) => {
                const { error } = res.body;
                assert.isUndefined(error);
                const issues = res.body;
                assert.isDefined(issues);
                assert.equal(issues.length, 5);
                done4 = true;
                checkDone();
            });

            sendReqAndTest(`/api/issues/${projectName}?open=0`, (err, res) => {
                const { error } = res.body;
                assert.isUndefined(error);
                const issues = res.body;
                assert.isDefined(issues);
                assert.equal(issues.length, 2);
                done5 = true;
                checkDone();
            });

            sendReqAndTest(`/api/issues/${projectName}?status_text=In%20QA%202`, (err, res) => {
                const { error } = res.body;
                assert.isUndefined(error);
                const issues = res.body;
                assert.isDefined(issues);
                assert.equal(issues.length, 1);
                done6 = true;
                checkDone();
            });
        });

        test('View issues on a project with multiple filters', (done) => {
            let projectName = 'testProject 1';

            let done1 = false,
                done2 = false,
                done3 = false;

            function checkDone() {
                if (done1 && done2 && done3) done();
            }
  
            sendReqAndTest(`/api/issues/${projectName}?issue_title=Fix%20error%20in%20posting%20data%202&created_by=Joe%201`, (err, res) => {
                const { error } = res.body;
                assert.isUndefined(error);
                const issues = res.body;
                assert.isDefined(issues);
                assert.equal(issues.length, 1);
                done1 = true;
                checkDone();
            });
  
            sendReqAndTest(`/api/issues/${projectName}?created_by=Joe%202&assigned_to=Joe%201`, (err, res) => {
                const { error } = res.body;
                assert.isUndefined(error);
                const issues = res.body;
                assert.isDefined(issues);
                assert.isEmpty(issues);
                done2 = true;
                checkDone();
            });
  
            sendReqAndTest(`/api/issues/${projectName}?open=0&status_text=In%20QA%203`, (err, res) => {
                const { error } = res.body;
                assert.isUndefined(error);
                const issues = res.body;
                assert.isDefined(issues);
                assert.equal(issues.length, 1);
                done3 = true;
                checkDone();
            });
        });

        suiteTeardown(async () => {
            await deleteIssues('testProject 1');
            await deleteIssues('testProject 2');
        });
  
    });

    suite('issue update', () => {

        const createdIssueIds = [];
  
        suiteSetup(async () => {
            await deleteIssues('testProject 1');
            await deleteIssues('testProject 2');
            // first 5 items to testProject 1, the other 5 items to testProject 2
            // multiples of 3 are not open. The others are.
            // testProject 1 created and assigned to Joe 1. testProject 2: Joe 2.
            for (let i = 0; i <= 9; i++) {
                const projectN = i <= 4 ? 1 : 2;
                const n = i % 5;
                let projectName = `testProject ${projectN}`;
                let issue_title = `Fix error in posting data ${n}`;
                let issue_text = `When we post data it has an error ${n}`;
                let created_by = `Joe ${projectN}`;
                let assigned_to = `Joe ${projectN}`;
                let open = n % 3 == 0 ? false : true;
                let status_text = `In QA ${n}`;
      
                const issue = await createIssue(projectName, { issue_title, issue_text, created_by, assigned_to, open, status_text });
                createdIssueIds.push(issue._id);
            }
        });
  
        test('Update one field on an issue', (done) => {
            const projectName = 'testProject 1';
            let id = createdIssueIds[1];
            const newIssueTitle = 'Fix error in posting data, changed';
            const msg = 'successfully updated';
  
            sendReqAndTest(`/api/issues/${projectName}`, async (err, res) => {
                const result = res.body;
                assert.equal(result.result, msg);
                assert.equal(result._id, id);

                let issues = await getIssues(projectName, { _id: id });
                assert.isNotEmpty(issues);
                assert.equal(issues[0].issue_title, newIssueTitle);

                id = createdIssueIds[0];
                issues = await getIssues(projectName, { _id: id });
                assert.equal(issues[0].issue_title, 'Fix error in posting data 0');
                done();
            }, http_put, { issue_title: newIssueTitle, _id: id });
        });

        test('Update multiple fields on an issue', (done) => {
            const projectName = 'testProject 1';
            let id = createdIssueIds[1];
            const newIssueTitle = 'Fix error in posting data, changed';
            const newIssueText = 'When we post data it has an error, changed';
            const newAssignedTo = 'Another User';
            const newOpen = true;
            const newStatusText = 'In QA, changed';
          
            const msg = 'successfully updated';

            sendReqAndTest(`/api/issues/${projectName}`, async (err, res) => {
                const result = res.body;
                assert.equal(result.result, msg);
                assert.equal(result._id, id);

                let issues = await getIssues(projectName, { _id: id });
                assert.equal(issues[0].issue_title, newIssueTitle);
                assert.equal(issues[0].issue_text, newIssueText);
                assert.equal(issues[0].assigned_to, newAssignedTo);
                assert.equal(issues[0].open, newOpen);
                assert.equal(issues[0].status_text, newStatusText);

                id = createdIssueIds[0]
                issues = await getIssues(projectName, { _id: id });
                assert.equal(issues[0].issue_title, 'Fix error in posting data 0');
                assert.equal(issues[0].issue_text, 'When we post data it has an error 0');
                assert.equal(issues[0].assigned_to, 'Joe 1');
                assert.equal(issues[0].open, false);
                assert.equal(issues[0].status_text, 'In QA 0');
                done();
            }, http_put, { 
              issue_title: newIssueTitle, 
              issue_text: newIssueText,
              assigned_to: newAssignedTo,
              open: newOpen,
              status_text: newStatusText,
              _id: id 
            });
        });

        test('Update an issue with missing _id', (done) => {
            const projectName = 'testProject 1';
            const newIssueTitle = 'Fix error in posting data, changed';
            const error = 'missing _id';

            sendReqAndTest(`/api/issues/${projectName}`, (err, res) => {
                const result = res.body;
                assert.equal(result.error, error);
                done();
            }, http_put, { issue_title: newIssueTitle });
        });

        test('Update an issue with no fields to update', (done) => {
            const projectName = 'testProject 1';
            const _id = new mongoose.Types.ObjectId().toString();
            const expectedResult = { error: 'no update field(s) sent', '_id': _id };

            sendReqAndTest(`/api/issues/${projectName}`, (err, res) => {
                const result = res.body;
                assert.deepEqual(result, expectedResult);
                done();
            }, http_put, { _id });
        });

        test('Update an issue with an invalid _id', (done) => {
            const projectName = 'testProject 1';
            const newIssueTitle = 'Fix error in posting data, changed';
            const _id = new mongoose.Types.ObjectId().toString();
            const expectedResult = { error: 'could not update', '_id': _id };

            sendReqAndTest(`/api/issues/${projectName}`, (err, res) => {
                const result = res.body;
                assert.deepEqual(result, expectedResult);
                done();
            }, http_put, { _id, newIssueTitle });
        });
  
        suiteTeardown(async () => {
            await deleteIssues('testProject 1');
            await deleteIssues('testProject 2');
        });
    });

    suite('delete issue', () => {

        const createdIssueIds = [];

        suiteSetup(async () => {
            await deleteIssues('testProject 1');
            await deleteIssues('testProject 2');
            // first 5 items to testProject 1, the other 5 items to testProject 2
            // multiples of 3 are not open. The others are.
            // testProject 1 created and assigned to Joe 1. testProject 2: Joe 2.
            for (let i = 0; i <= 9; i++) {
                const projectN = i <= 4 ? 1 : 2;
                const n = i % 5;
                let projectName = `testProject ${projectN}`;
                let issue_title = `Fix error in posting data ${n}`;
                let issue_text = `When we post data it has an error ${n}`;
                let created_by = `Joe ${projectN}`;
                let assigned_to = `Joe ${projectN}`;
                let open = n % 3 == 0 ? false : true;
                let status_text = `In QA ${n}`;

                const issue = await createIssue(projectName, { issue_title, issue_text, created_by, assigned_to, open, status_text });

                createdIssueIds.push(issue._id);
            }
        });

        test('delete an issue', (done) => {
            const projectName = 'testProject 1';
            const id = createdIssueIds[1];
            const msg = 'successfully deleted';

            sendReqAndTest(`/api/issues/${projectName}?_id=${id}`, async (err, res) => {
                const result = res.body;
                assert.isUndefined(result.error);
                assert.equal(result.result, msg);
                assert.equal(result._id, id);

                const issues = await getIssues(projectName, { _id: id });
                assert.equal(issues.length, 0);
                done();
            }, http_delete);
        });

        test('Delete an issue with missing _id', (done) => {
            const projectName = 'testProject 1';
            const error = 'missing _id';

            sendReqAndTest(`/api/issues/${projectName}`, (err, res) => {
                const result = res.body;
                assert.equal(result.error, error);
                done();
            }, http_delete);
        });

        test('Delete an issue with an invalid _id', (done) => {
            const projectName = 'testProject 1';
            const id = new mongoose.Types.ObjectId().toString();
            const expectedResult = { error: 'could not delete', '_id': id };

            sendReqAndTest(`/api/issues/${projectName}?_id=${id}`, (err, res) => {
                const result = res.body;
                assert.deepEqual(result, expectedResult);
                done();
            }, http_delete);
        });

        suiteTeardown(async () => {
            await deleteIssues('testProject 1');
            await deleteIssues('testProject 2');
        });
    });
  
});
