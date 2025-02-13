export class MazeGenerator {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.maze = Array(width).fill().map(() => Array(height).fill(0));
    }

    generate() {
        // Remplir les bordures
        for (let x = 0; x < this.width; x++) {
            this.maze[x][0] = 1;
            this.maze[x][this.height - 1] = 1;
        }
        for (let y = 0; y < this.height; y++) {
            this.maze[0][y] = 1;
            this.maze[this.width - 1][y] = 1;
        }

        // Ajouter des murs indestructibles en motif
        for (let x = 2; x < this.width - 1; x += 2) {
            for (let y = 2; y < this.height - 1; y += 2) {
                this.maze[x][y] = 1;
            }
        }

        return this.maze;
    }
}
