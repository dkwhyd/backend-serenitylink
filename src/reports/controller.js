const ReportUser = require('./model');
const path = require('path');
const fs = require('fs');

async function addReport(req, res, next) {
  if (!req.user) {
    return res.json({
      error: 1,
      message: `You're not not login or token expired`,
    });
  }
  try {
    const user = req.user;
    const payload = req.body;
    const newReport = new ReportUser({
      ...payload,
      reporter: user._id,
    });

    await newReport.save();
    if (newReport) {
      return res.json({
        status: 'ok',
        message: 'report sent successfully',
        idReport: newReport._id,
      });
    }
  } catch (err) {
    if (err && err.name === 'ValidationError') {
      return res.json({
        error: 1,
        message: err.message,
        fields: err.errors,
      });
    }
    next(err);
  }
}

async function getDetailReport(req, res, next) {
  if (!req.user) {
    return res.json({
      error: 1,
      message: `You're not not login or token expired`,
    });
  }
  try {
    const report = await ReportUser.findOne({ _id: req.params.id })
      .populate({
        path: 'comment',
        select: ['message', 'name'],
      })
      .populate({
        path: 'reporter',
        select: ['_id', 'name'],
      })
      .populate('officerReport')
      .populate({ path: 'unitWorks', select: ['_id ', 'name', 'image'] })
      .select('-__v');
    if (report) {
      res.json({
        status: 'ok',
        data: report,
      });
    }
  } catch (err) {
    return res.json({
      error: 1,
      message: 'report not found',
    });
    next(err);
  }
}

async function getAllReport(req, res, next) {
  try {
    let { limit = 10, skip = 0, q = '' } = req.query;

    let criteria = {};
    if (q.length) {
      criteria = {
        ...criteria,
        title: { $regex: `${q}`, $options: 'i' },
      };
    }
    const count = await ReportUser.find().countDocuments();
    const report = await ReportUser.find(criteria)
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .populate({
        path: 'comment',
        select: ['message', 'name'],
      })
      .select(
        '_id title status description imageReport createdAt address -comment ',
      );
    if (report) {
      res.json({
        status: 'ok',
        count,
        data: report,
      });
    }
  } catch (err) {
    return res.json({
      error: 1,
      message: err.message,
    });
    next(err);
  }
}

async function editReportToProcess(req, res, next) {
  if (!req.user) {
    return res.json({
      error: 1,
      message: `You're not not login or token expired`,
    });
  }
  try {
    const payload = req.body;
    const userRole = req.user.role;
    if (userRole === 'user') {
      res.json({
        error: 1,
        message: 'your not allowed access',
      });
    } else {
      const report = await ReportUser.findOneAndUpdate(
        { _id: req.params.id },
        { $set: { unitWorks: payload.unitwork, status: 'process' } },
      );
      if (report) {
        return res.json({
          status: 'oke',
          message: 'unit work has a job',
        });
      }
    }
  } catch (error) {
    return res.json({
      error: 1,
      message: 'report id or unit work not found',
    });
  }
}

module.exports = {
  getDetailReport,
  getAllReport,
  addReport,
  editReportToProcess,
};
