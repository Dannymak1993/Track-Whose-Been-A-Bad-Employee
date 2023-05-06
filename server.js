const inquirer = require('inquirer');
const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Rs12121221!!!',
    database: 'employees_db'
});

const query = (sql, args) => {
    return new Promise((resolve, reject) => {
        connection.query(sql, args, (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
};

const promptUser = async () => {
    const { action } = await inquirer.prompt([
        {
            type: 'list',
            message: 'What would you like to do?',
            name: 'action',
            choices: ['View All Employees', 'Add Employee', 'Update Employee Role', 'View All Roles', 'Add Role', 'View All Departments', 'Add Department', 'Quit']
        }
    ]);

    switch (action) {
        case 'View All Employees':
            try {
                const employees = await query(`
                    SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager
                    FROM employee
                    JOIN role ON employee.role_id = role.id
                    JOIN department ON role.department_id = department.id
                    LEFT JOIN employee manager ON employee.manager_id = manager.id;
                `);
                console.table(employees);
            } catch (error) {
                console.log(error);
            }
            break;
        case 'Add Employee':
            // code to add an employee
            break;
        case 'Update Employee Role':
            // code to update an employee's role
            break;
        case 'View All Roles':
            try {
                const roles = await query(`
                    SELECT role.id, role.title, department.name AS department, role.salary
                    FROM role
                    INNER JOIN department ON role.department_id = department.id;
                `);
                console.table(roles);
            } catch (error) {
                console.log(error);
            }
            break;
        case 'Add Role':
            // code to add a role
            break;
        case 'View All Departments':
            try {
                const departments = await query(`
            SELECT DISTINCT name AS department
            FROM department;
        `);
                console.table(departments);
            } catch (error) {
                console.log(error);
            }
            break;
        case 'Add Department':
            // code to add a department
            break;
        case 'Quit':
            connection.end();
            return;
    }
    await promptUser();
};

promptUser();