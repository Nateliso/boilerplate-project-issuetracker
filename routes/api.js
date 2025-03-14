'use strict';

const issuesDB = {};
// Unique ID generator
const generateId = () => `${Date.now()}-${Math.floor(Math.random() * 100000)}`;

module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get((req, res) => {
      let project = req.params.project;
      let { _id, open, issue_title, issue_text, created_by, assigned_to, status_text } = req.query;

      if (!issuesDB[project]) return res.json([]);

      let filteredIssues = issuesDB[project];

      if (_id) filteredIssues = filteredIssues.filter(issue => issue._id === _id);
      if (open) filteredIssues = filteredIssues.filter(issue => issue.open === (open === 'true'));
      if (issue_title) filteredIssues = filteredIssues.filter(issue => issue.issue_title === issue_title);
      if (issue_text) filteredIssues = filteredIssues.filter(issue => issue.issue_text === issue_text);
      if (created_by) filteredIssues = filteredIssues.filter(issue => issue.created_by === created_by);
      if (assigned_to) filteredIssues = filteredIssues.filter(issue => issue.assigned_to === assigned_to);
      if (status_text) filteredIssues = filteredIssues.filter(issue => issue.status_text === status_text);

      res.json(filteredIssues);
    })
    
    .post((req, res) => {
      let project = req.params.project;
      let { issue_title, issue_text, created_by, assigned_to, status_text } = req.body;

      // Check required fields
      if (!issue_title || !issue_text || !created_by) {
        return res.json({ error: 'required field(s) missing' });
      }

      let newIssue = {
        _id: generateId(),
        issue_title,
        issue_text,
        created_by,
        assigned_to: assigned_to || '',
        status_text: status_text || '',
        created_on: new Date(),
        updated_on: new Date(),
        open: true
      };

      if (!issuesDB[project]) issuesDB[project] = [];
      issuesDB[project].push(newIssue);

      res.json(newIssue);
    })
    
    .put((req, res) => {
      let project = req.params.project;
      let { _id, issue_title, issue_text, created_by, assigned_to, status_text, open } = req.body;
  
      if (!_id) return res.json({ error: 'missing _id' });
  
      // Check if no update fields were provided (excluding _id)
      let updateFields = Object.keys(req.body).filter(key => key !== '_id');
      if (updateFields.length === 0) {
          return res.json({ error: 'no update field(s) sent', _id });
      }
  
      if (!issuesDB[project]) return res.json({ error: 'could not update', _id });
  
      let issue = issuesDB[project].find(issue => issue._id === _id);
      if (!issue) return res.json({ error: 'could not update', _id });
  
      // Update fields only if they are provided
      if (issue_title !== undefined) issue.issue_title = issue_title;
      if (issue_text !== undefined) issue.issue_text = issue_text;
      if (created_by !== undefined) issue.created_by = created_by;
      if (assigned_to !== undefined) issue.assigned_to = assigned_to;
      if (status_text !== undefined) issue.status_text = status_text;
      if (open !== undefined) issue.open = open === 'true';
  
      issue.updated_on = new Date();
  
      res.json({ result: 'successfully updated', _id });
  })
    
    .delete((req, res) => {
      let project = req.params.project;
      let { _id } = req.body;

      if (!_id) return res.json({ error: 'missing _id' });
      if (!issuesDB[project]) return res.json({ error: 'could not delete', _id });

      let index = issuesDB[project].findIndex(issue => issue._id === _id);
      if (index === -1) return res.json({ error: 'could not delete', _id });

      issuesDB[project].splice(index, 1);
      res.json({ result: 'successfully deleted', _id });
    });
    
};
