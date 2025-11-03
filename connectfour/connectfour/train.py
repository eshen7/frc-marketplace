import gym
from stable_baselines3 import PPO
from stable_baselines3.common.env_checker import check_env
from env import ConnectFourEnv
import numpy as np

def random_opponent_policy(state):
    return np.random.choice(range(18))

env = ConnectFourEnv(opponent_policy=random_opponent_policy)

check_env(env, warn=True)

model = PPO("MlpPolicy", env, verbose=1)

model.learn(total_timesteps=10000)

model.save("connect_four_agent")

env = ConnectFourEnv(opponent_policy=random_opponent_policy)
obs, _ = env.reset()
done = False

while not done:
    action, _ = model.predict(obs)
    obs, reward, done, truncated, info = env.step(action)
    env.render()
    print("Reward:", reward)
    print("Info:", info)