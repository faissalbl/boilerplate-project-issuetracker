const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const { createIssue, getIssues, clear } = require('../models/project');

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
        test('Create an issue with every field', () => {
            const now = new Date().toISOString();
    
            const issue = {
                //_id: this.idSeq++,
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
            }, http_post, issue);
        });
    
        test('Create an issue with only required fields', () => {
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
                assert.isFalse(open);
                assert.equal(status_text, '');
            }, http_post, issue);
        });
    
        test('Create an issue with missing required fields', () => {
            const expectedError = 'required field(s) missing';
    
            sendReqAndTest('/api/issues/mytestproject', (err, res) => {
                const { error } = res.body;
                assert.equal(error, expectedError);
            }, http_post);
    
            let issue = {
                issue_title: 'my test issue 1',
                issue_text: 'this is my test issue 1',
            };
    
            sendReqAndTest('/api/issues/mytestproject', (err, res) => {
                const { error } = res.body;
                assert.equal(error, expectedError);
            }, http_post, issue);
    
            issue = {
                issue_title: 'my test issue 1',
                created_by: 'Faissal',
            };
    
            sendReqAndTest('/api/issues/mytestproject', (err, res) => {
                const { error } = res.body;
                assert.equal(error, expectedError);
            }, http_post, issue);
    
            issue = {
                issue_text: 'this is my test issue 1',
                created_by: 'Faissal',
            };
    
            sendReqAndTest('/api/issues/mytestproject', (err, res) => {
                const { error } = res.body;
                assert.equal(error, expectedError);
            }, http_post, issue);
    
            issue = {};
    
            sendReqAndTest('/api/issues/mytestproject', (err, res) => {
                const { error } = res.body;
                assert.equal(error, expectedError);
            }, http_post, issue);
    
            issue = null;
    
            sendReqAndTest('/api/issues/mytestproject', (err, res) => {
                const { error } = res.body;
                assert.equal(error, expectedError);
            }, http_post, issue);
        });

        teardown(() => clear());
    });
  
    suite('view issues on a project', () => {

        suiteSetup(() => {
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
      
                createIssue(projectName, { issue_title, issue_text, created_by, assigned_to, open, status_text });
            }
        });
  
      
        test('View issues on a project', () => {
            [
                {proj: 'testProject 1', joe: 'Joe 1'}, 
                {proj: 'testProject 2', joe: 'Joe 2'}
            ].forEach(item => {  
                sendReqAndTest(`/api/issues/${item.proj}`, (err, res) => {
                    const { error } = res.body;
                    assert.isUndefined(error);
                    const issues = res.body;
                    assert.isDefined(issues);
                    assert.equal(issues.length, 5);
                    issues.forEach(issue => {                  
                        const { _id, issue_title, issue_text, created_on, updated_on, created_by, assigned_to, open, status_text, error } = issue;
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
                        }
                    });
                });
            });
        });

        test('View issues on a project with one filter', () => {
            let projectName = 'testProject 1';
            let issues = getIssues(projectName, { _id: 2 });
            assert.equal(issues.length, 1);

            sendReqAndTest(`/api/issues/${projectName}?_id=2`, (err, res) => {
                const { error } = res.body;
                assert.isUndefined(error);
                const issues = res.body;
                assert.isDefined(issues);
                assert.equal(issues.length, 1);
            });

            sendReqAndTest(`/api/issues/${projectName}?issue_title=Fix%20error%20in%20posting%20data%202`, (err, res) => {
                const { error } = res.body;
                assert.isUndefined(error);
                const issues = res.body;
                assert.isDefined(issues);
                assert.equal(issues.length, 1);
            });
            
            sendReqAndTest(`/api/issues/${projectName}?created_by=Joe%201`, (err, res) => {
                const { error } = res.body;
                assert.isUndefined(error);
                const issues = res.body;
                assert.isDefined(issues);
                assert.equal(issues.length, 5);
            });

            sendReqAndTest(`/api/issues/${projectName}?created_by=Joe%202`, (err, res) => {
                const { error } = res.body;
                assert.isUndefined(error);
                const issues = res.body;
                assert.isDefined(issues);
                assert.isEmpty(issues);
            });
            
            sendReqAndTest(`/api/issues/${projectName}?assigned_to=Joe%201`, (err, res) => {
                const { error } = res.body;
                assert.isUndefined(error);
                const issues = res.body;
                assert.isDefined(issues);
                assert.equal(issues.length, 5);
            });

            sendReqAndTest(`/api/issues/${projectName}?open=0`, (err, res) => {
                const { error } = res.body;
                assert.isUndefined(error);
                const issues = res.body;
                assert.isDefined(issues);
                assert.equal(issues.length, 2);
            });

            sendReqAndTest(`/api/issues/${projectName}?status_text=In%20QA%202`, (err, res) => {
                const { error } = res.body;
                assert.isUndefined(error);
                const issues = res.body;
                assert.isDefined(issues);
                assert.equal(issues.length, 1);
            });
        });

        test('View issues on a project with multiple filters', () => {
            let projectName = 'testProject 1';
  
            sendReqAndTest(`/api/issues/${projectName}?_id=3&issue_title=Fix%20error%20in%20posting%20data%202&created_by=Joe%201`, (err, res) => {
                const { error } = res.body;
                assert.isUndefined(error);
                const issues = res.body;
                assert.isDefined(issues);
                assert.equal(issues.length, 1);
            });
  
            sendReqAndTest(`/api/issues/${projectName}?created_by=Joe%202&assigned_to=Joe%201`, (err, res) => {
                const { error } = res.body;
                assert.isUndefined(error);
                const issues = res.body;
                assert.isDefined(issues);
                assert.isEmpty(issues);
            });
  
            sendReqAndTest(`/api/issues/${projectName}?open=0&status_text=In%20QA%203`, (err, res) => {
                const { error } = res.body;
                assert.isUndefined(error);
                const issues = res.body;
                assert.isDefined(issues);
                assert.equal(issues.length, 1);
            });
        });

        suiteTeardown(() => clear());
    });

    suite('issue update', () => {
  
        suiteSetup(() => {
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
      
                createIssue(projectName, { issue_title, issue_text, created_by, assigned_to, open, status_text });
            }
        });
  
        test('Update one field on an issue', () => {
            const projectName = 'testProject 1';
            const id = 2;
            const newIssueTitle = 'Fix error in posting data, changed';
            const msg = 'successfully updated';
  
            sendReqAndTest(`/api/issues/${projectName}`, (err, res) => {
                const result = res.body;
                assert.equal(result.result, msg);
                assert.equal(result._id, id);

                let issues = getIssues(projectName, { _id: id });
                assert.equal(issues[0].issue_title, newIssueTitle);

                issues = getIssues(projectName, { _id: 1 });
                assert.equal(issues[0].issue_title, 'Fix error in posting data 0');
            }, http_put, { issue_title: newIssueTitle, _id: id });;
        });

        test('Update multiple fields on an issue', () => {
            const projectName = 'testProject 1';
            const id = 2;
            const newIssueTitle = 'Fix error in posting data, changed';
            const newIssueText = 'When we post data it has an error, changed';
            const newAssignedTo = 'Another User';
            const newOpen = true;
            const newStatusText = 'In QA, changed';
          
            const msg = 'successfully updated';

            sendReqAndTest(`/api/issues/${projectName}`, (err, res) => {
                const result = res.body;
                assert.equal(result.result, msg);
                assert.equal(result._id, id);

                let issues = getIssues(projectName, { _id: id });
                assert.equal(issues[0].issue_title, newIssueTitle);
                assert.equal(issues[0].issue_text, newIssueText);
                assert.equal(issues[0].assigned_to, newAssignedTo);
                assert.equal(issues[0].open, newOpen);
                assert.equal(issues[0].status_text, newStatusText);

                issues = getIssues(projectName, { _id: 1 });
                assert.equal(issues[0].issue_title, 'Fix error in posting data 0');
                assert.equal(issues[0].issue_text, 'When we post data it has an error 0');
                assert.equal(issues[0].assigned_to, 'Joe 1');
                assert.equal(issues[0].open, false);
                assert.equal(issues[0].status_text, 'In QA 0');
            }, http_put, { 
              issue_title: newIssueTitle, 
              issue_text: newIssueText,
              assigned_to: newAssignedTo,
              open: newOpen,
              status_text: newStatusText,
              _id: id 
            });;
        });

        test('Update an issue with missing _id', () => {
            const projectName = 'testProject 1';
            const newIssueTitle = 'Fix error in posting data, changed';
            const error = 'missing _id';

            sendReqAndTest(`/api/issues/${projectName}`, (err, res) => {
                const result = res.body;
                assert.equal(result.error, error);
            }, http_put, { issue_title: newIssueTitle });;
        });

        test('Update an issue with no fields to update', () => {
            const projectName = 'testProject 1';
            const _id = 2;
            const expectedResult = { error: 'no update field(s) sent', '_id': _id };

            sendReqAndTest(`/api/issues/${projectName}`, (err, res) => {
                const result = res.body;
                assert.deepEqual(result, expectedResult);
            }, http_put, { _id });;
        });

        test('Update an issue with an invalid _id', () => {
            const projectName = 'testProject 1';
            const newIssueTitle = 'Fix error in posting data, changed';
            const _id = 99;
            const expectedResult = { error: 'could not update', '_id': _id };

            sendReqAndTest(`/api/issues/${projectName}`, (err, res) => {
                const result = res.body;
                assert.deepEqual(result, expectedResult);
            }, http_put, { _id, newIssueTitle });;
        });
  
        suiteTeardown(() => clear());
    });

    suite('delete issue', () => {

        suiteSetup(() => {
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

                createIssue(projectName, { issue_title, issue_text, created_by, assigned_to, open, status_text });
            }
        });

        test('delete an issue', () => {
            const projectName = 'testProject 1';
            const id = 2;
            const msg = 'successfully deleted';

            sendReqAndTest(`/api/issues/${projectName}?_id=${id}`, (err, res) => {
                const result = res.body;
                assert.isUndefined(result.error);
                assert.equal(result.result, msg);
                assert.equal(result._id, id);

                let issues = getIssues(projectName, { _id: id });
                assert.equal(issues.length, 0);
            }, http_delete);
        });

        test('Delete an issue with missing _id', () => {
            const projectName = 'testProject 1';
            const error = 'missing _id';

            sendReqAndTest(`/api/issues/${projectName}`, (err, res) => {
                const result = res.body;
                assert.equal(result.error, error);
            }, http_delete);
        });

        test('Delete an issue with an invalid _id', () => {
            const projectName = 'testProject 1';
            const id = 99;
            const expectedResult = { error: 'could not delete', '_id': _id };

            sendReqAndTest(`/api/issues/${projectName}?_id=${_id}`, (err, res) => {
                const result = res.body;
                assert.deepEqual(result, expectedResult);
            }, http_delete);
        });

        suiteTeardown(() => clear());
    });
  
});
