import gymnasium
from gymnasium import spaces
import numpy as np


class ConnectFourEnv(gymnasium.Env):
    def __init__(self, opponent_policy=None):
        super(ConnectFourEnv, self).__init__()
        self.action_space = spaces.Discrete(18)
        self.observation_space = spaces.Box(low=0, high=2, shape=(4, 4, 4), dtype=np.uint8)
        self.opponent_policy = opponent_policy
        self.state = np.zeros((4, 4, 4), dtype=np.uint8)
        self.current_player = 1

    def reset(self, *, seed=None, options=None):
        super().reset(seed=seed)
        self.state = np.zeros((4, 4, 4), dtype=np.uint8)
        self.current_player = 1
        return self.state, {}

    def rotate(self, right):
        k = 1 if right else -1
        for layer in range(self.state.shape[2]):
            self.state[1:3, 1:3, layer] = np.rot90(self.state[1:3, 1:3, layer], k=k)

    def update_state(self, x, y):
        for z in range(4):
            if self.state[x, y, z] == 0:
                self.state[x, y, z] = self.current_player
                return True
        return False

    def gym_to_state(self, action):
        if action == 16:
            self.rotate(True)
            return True
        elif action == 17:
            self.rotate(False)
            return False
        else:
            x = action % 4
            y = action // 4
            return self.update_state(x, y)

    def check_win(self, player):
        for axis in range(3):
            for i in range(4):
                slice_ = np.take(self.state, i, axis=axis)
                if self.check_2d_win(slice_, player):
                    return True
        if all(self.state[i, i, i] == player for i in range(4)): return True
        if all(self.state[i, i, 3 - i] == player for i in range(4)): return True
        if all(self.state[i, 3 - i, i] == player for i in range(4)): return True
        if all(self.state[3 - i, i, i] == player for i in range(4)): return True
        return False

    def check_2d_win(self, grid, player):
        for i in range(4):
            if np.all(grid[i, :] == player): return True
            if np.all(grid[:, i] == player): return True
        if np.all(np.diag(grid) == player): return True
        if np.all(np.diag(np.fliplr(grid)) == player): return True
        return False

    def step(self, action):
        valid = self.gym_to_state(action)
        if not valid:
            return self.state, -1.0, True, False, {"error": "Invalid move"}

        if self.check_win(self.current_player):
            return self.state, 1.0, True, False, {"winner": self.current_player}

        self.current_player = 2 if self.current_player == 1 else 1

        opponent_action = self.opponent_policy(self.state.copy()) if self.opponent_policy else np.random.choice(range(18))

        self.gym_to_state(opponent_action)

        if self.check_win(self.current_player):
            return self.state, -1.0, True, False, {"winner": self.current_player}

        self.current_player = 2 if self.current_player == 1 else 1

        return self.state, 0.0, False, False, {}

    def render(self):
        for z in range(3, -1, -1):
            print(f"Layer z={z}")
            print(self.state[:, :, z])
        print()