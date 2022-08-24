import * as express from 'express';

const router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
  res.json({
    message: 'Go Serverless v1.0! Your function executed successfully!',
  });
});

export default router;
