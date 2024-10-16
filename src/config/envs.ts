import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
  PORT: number;
  STRIPE_SECRET: string;
  STRIPE_SUCCESS_URL: string;
  STRIPE_CANCEL_URL: string;
  STRIPE_END_POINT_SECRET: string;
  NATS_SERVERS: string[];
}
const envsSchema = joi
  .object({
    PORT: joi.number().required(),
    STRIPE_SECRET: joi.string().required(),
    STRIPE_SUCCESS_URL: joi.string().required(),
    STRIPE_CANCEL_URL: joi.string().required(),
    STRIPE_END_POINT_SECRET: joi.string().required(),
    NATS_SERVERS: joi.array().items(joi.string()).required(),
  })
  .unknown(true);

const { error, value } = envsSchema.validate({
  ...process.env,
  NATS_SERVERS: process.env.NATS_SERVERS?.split(','),
});
if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const EnvVars: EnvVars = value;

export const envs = {
  port: EnvVars.PORT,
  stripe_secret: EnvVars.STRIPE_SECRET,
  srtipe_success_url: EnvVars.STRIPE_SUCCESS_URL,
  srtipe_cancel_url: EnvVars.STRIPE_CANCEL_URL,
  srtipe_en_point_secret_url: EnvVars.STRIPE_END_POINT_SECRET,
  nats_servers: EnvVars.NATS_SERVERS,
};
