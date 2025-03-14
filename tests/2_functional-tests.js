const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
    let testId;
    test('Create an issue with every field', function(done) {
        chai.request(server)
            .post('/api/issues/test')
            .send({
                issue_title: 'Test Title',
                issue_text: 'Test Text',
                created_by: 'Tester',
                assigned_to: 'Chai',
                status_text: 'In Progress'
            })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.property(res.body, '_id');
                testId = res.body._id; // Save for later tests
                done();
            });
    });

    test('Create an issue with only required fields', function(done) {
        chai.request(server)
            .post('/api/issues/test')
            .send({
                issue_title: 'Required Fields Only',
                issue_text: 'Only required',
                created_by: 'Tester'
            })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.property(res.body, '_id');
                done();
            });
    });

    test('Create an issue with missing required fields', function(done) {
        chai.request(server)
            .post('/api/issues/test')
            .send({})
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.body.error, 'required field(s) missing');
                done();
            });
    });

    test('View issues on a project', function(done) {
        chai.request(server)
            .get('/api/issues/test')
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.isArray(res.body);
                done();
            });
    });

    test('View issues on a project with one filter', function(done) {
        chai.request(server)
            .get('/api/issues/test?created_by=Tester')
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.isArray(res.body);
                res.body.forEach(issue => {
                    assert.equal(issue.created_by, 'Tester');
                });
                done();
            });
    });

    test('View issues on a project with multiple filters', function(done) {
        chai.request(server)
            .get('/api/issues/test?created_by=Tester&open=true')
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.isArray(res.body);
                res.body.forEach(issue => {
                    assert.equal(issue.created_by, 'Tester');
                    assert.equal(issue.open, true);
                });
                done();
            });
    });

    test('Update one field on an issue', function(done) {
        chai.request(server)
            .put('/api/issues/test')
            .send({ _id: testId, issue_text: 'Updated Text' })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.body.result, 'successfully updated');
                done();
            });
    });

    test('Update multiple fields on an issue', function(done) {
        chai.request(server)
            .put('/api/issues/test')
            .send({ _id: testId, issue_text: 'Updated Text Again', status_text: 'Fixed' })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.body.result, 'successfully updated');
                done();
            });
    });

    test('Update an issue with missing _id', function(done) {
        chai.request(server)
            .put('/api/issues/test')
            .send({ issue_text: 'Should not work' })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.body.error, 'missing _id');
                done();
            });
    });

    test('Update an issue with no fields to update', function(done) {
        chai.request(server)
            .put('/api/issues/test')
            .send({ _id: testId })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.body.error, 'no update field(s) sent');
                done();
            });
    });

    test('Update an issue with an invalid _id', function(done) {
        chai.request(server)
            .put('/api/issues/test')
            .send({ _id: 'invalid_id', issue_text: 'Should not work' })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.body.error, 'could not update');
                done();
            });
    });

    test('Delete an issue', function(done) {
        chai.request(server)
            .delete('/api/issues/test')
            .send({ _id: testId })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.body.result, 'successfully deleted');
                done();
            });
    });

    test('Delete an issue with an invalid _id', function(done) {
        chai.request(server)
            .delete('/api/issues/test')
            .send({ _id: 'invalid_id' })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.body.error, 'could not delete');
                done();
            });
    });

    test('Delete an issue with missing _id', function(done) {
        chai.request(server)
            .delete('/api/issues/test')
            .send({})
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.body.error, 'missing _id');
                done();
            });
    });
});
