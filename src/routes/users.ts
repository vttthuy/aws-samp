import * as express from 'express';
import * as asyncHandler from 'express-async-handler';
import { DynamoDB } from 'aws-sdk';
import { v4 } from 'uuid';
import * as createError from 'http-errors';

const router = express.Router();
const dynamoDb = new DynamoDB.DocumentClient();
const TableName = 'users';

/* GET users listing. */
router.get(
  '/',
  asyncHandler(async (req, res, next) => {
    const data = await dynamoDb
      .scan({
        TableName,
      })
      .promise();
    res.send(data.Items);
  })
);

/* DETAIL by ID */
router.get(
  '/:id',
  asyncHandler(async (req, res, next) => {
    const data = await dynamoDb
      .get({
        TableName,
        Key: {
          id: req.params.id,
        },
      })
      .promise();
    res.send(data.Item);
  })
);

/* ADD user */
router.post(
  '/',
  asyncHandler(async (req, res, next) => {
    const timestamp = new Date().toISOString();
    const Item = {
      ...req.body,
      id: v4(),
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    await dynamoDb
      .put({
        TableName,
        Item,
      })
      .promise();
    res.send(Item);
  })
);

/* UPDATE user */
router.put(
  '/:id',
  asyncHandler(async (req, res, next) => {
    let { Item } = await dynamoDb
      .get({
        TableName,
        Key: {
          id: req.params.id,
        },
      })
      .promise();
    if (!Item) {
      throw createError(404, 'User Not Found');
    }

    const timestamp = new Date().toISOString();
    Item = {
      ...req.body,
      updatedAt: timestamp,
    };
    let UpdateExpression = 'set';
    const ExpressionAttributeNames = {};
    const ExpressionAttributeValues = {};
    for (const property in Item) {
      UpdateExpression = `${UpdateExpression} #${property} = :${property} ,`;
      ExpressionAttributeNames[`#${property}`] = property;
      ExpressionAttributeValues[`:${property}`] = Item[property];
    }

    UpdateExpression = UpdateExpression.slice(0, -1);

    const data = await dynamoDb
      .update({
        TableName,
        Key: {
          id: req.params.id,
        },
        UpdateExpression,
        ExpressionAttributeNames,
        ExpressionAttributeValues,
        ReturnValues: 'ALL_NEW',
      })
      .promise();
    res.send(data.Attributes);
  })
);

/* DELETE user */
router.delete(
  '/:id',
  asyncHandler(async (req, res, next) => {
    await dynamoDb
      .delete({
        TableName,
        Key: {
          id: req.params.id,
        },
      })
      .promise();
    res.send({
      id: req.params.id,
    });
  })
);

export default router;
