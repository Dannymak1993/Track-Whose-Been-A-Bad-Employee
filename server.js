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

const viewEmployees = async () => {
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
    promptUser();
}

const addEmployee = async () => {
    try {
        const roleData = await query("select * from role");
        const roleChoices = roleData.map(({ id, title }) => ({ name: title, value: id }));
        const employeeData = await query("select * from employee");
        const employeeChoices = employeeData.map(({ id, first_name, last_name }) => ({ name: `${first_name} ${last_name}`, value: id }));
        const response = await inquirer.prompt([
            {
                type: 'input',
                message: 'Enter the first name of the new employee:',
                name: 'employeeFirst',
            },
            {
                type: 'input',
                message: 'Enter the last name of the new employee:',
                name: 'employeeLast',
            },
            {
                type: 'list',
                message: "What is this employee's role?",
                choices: roleChoices,
                name: "roleID",
            },
            {
                type: 'list',
                message: "Who is this employee's manager?",
                choices: [...employeeChoices, { name: "none", value: null }],
                name: "employeeID",
            }
        ]);

        console.log(response);

        await query(`INSERT INTO employee (first_name, last_name, role_id, manager_id)VALUES (?,?,?,?);`, [response.employeeFirst, response.employeeLast, response.roleID, response.employeeID]);

        console.log(`New employee "${response.employeeFirst}", has been added.`);
    } catch (error) {
        console.log(error);
    }
    promptUser();
}

const deleteEmployee = async () => {
    try {
        const employees = await query("SELECT * FROM employee");
        const employeeChoices = employees.map(({ id, first_name, last_name }) => ({ name: `${first_name} ${last_name}`, value: id }));

        const { employeeId } = await inquirer.prompt({
            type: "list",
            name: "employeeId",
            message: "Which employee would you like to delete?",
            choices: employeeChoices,
        });

        await query("DELETE FROM employee WHERE id=?", [employeeId]);

        console.log(`Successfully deleted employee with ID ${employeeId}`);
    } catch (error) {
        console.log(error);
    }

    promptUser();
};

const updateEmployeeRole = async () => {
    try {
        // Get employee data and role choices
        const employeeData = await query("SELECT * FROM employee");
        const employeeChoices = employeeData.map(({ id, first_name, last_name }) => ({
            name: `${first_name} ${last_name}`,
            value: id,
        }));
        const roleData = await query("SELECT * FROM role");
        const roleChoices = roleData.map(({ id, title }) => ({ name: title, value: id }));

        // Prompt user for employee and new role information
        const response = await inquirer.prompt([
            {
                type: "list",
                message: "Which employee's role would you like to update?",
                name: "employeeId",
                choices: employeeChoices,
            },
            {
                type: "list",
                message: "What is the employee's new role?",
                name: "newRoleId",
                choices: roleChoices,
            },
        ]);

        // Update employee's role in database
        const { employeeId, newRoleId } = response;
        await query("UPDATE employee SET role_id = ? WHERE id = ?", [newRoleId, employeeId]);
        console.log("Employee role updated successfully!");
    } catch (error) {
        console.log(error);
    }
    promptUser();
};

const viewRoles = async () => {
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
    promptUser();
}

const addRole = async () => {
    try {
        const departmentData = await query("select * from department");
        const departmentChoices = departmentData.map(({ id, name }) => ({ name: name, value: id }));
        const response = await inquirer.prompt([
            {
                type: 'input',
                message: "What is the new role?",
                name: "newRole",
            },
            {
                type: 'input',
                message: 'What is the salary for the new role?',
                name: 'salary',
            },
            {
                type: 'list',
                message: "In what department does this role belong?",
                name: "departmentId",
                choices: departmentChoices
            }
        ]);
        const { newRole, salary, departmentId } = response;
        const queryStr = 'INSERT INTO role SET ?';
        await query(queryStr, { title: newRole, salary: salary, department_id: departmentId });
        console.log(`New role '${newRole}' has been added to the database.`);
    } catch (error) {
        console.log(error);
    }
    promptUser();
}

const deleteRole = async () => {
    try {
        const roles = await query("SELECT id, title FROM role");

        const roleChoices = roles.map(({ id, title }) => ({
            name: title,
            value: id
        }));

        const response = await inquirer.prompt({
            type: "list",
            name: "roleId",
            message: "Which role would you like to delete?",
            choices: roleChoices
        });

        await query("DELETE FROM role WHERE id = ?", [response.roleId]);

        console.log("Role successfully deleted.");
    } catch (error) {
        console.log(error);
    }

    promptUser();
};

const viewDepartments = async () => {
    try {
        const departments = await query(`
            SELECT DISTINCT name AS department
            FROM department;
        `);
        console.table(departments);
    } catch (error) {
        console.log(error);
    }
    promptUser();
}

const addDepartment = async () => {
    try {
        const { departmentName } = await inquirer.prompt([
            {
                type: 'input',
                message: 'Enter the name of the new department:',
                name: 'departmentName',
            }
        ]);

        await query(`INSERT INTO department (name)VALUES (?);`, [departmentName]);

        console.log(`Department "${departmentName}" has been added.`);
    } catch (error) {
        console.log(error);
    }
    promptUser();
}

const deleteDepartment = async () => {
    try {
        const departmentData = await query("SELECT * FROM department");
        const departmentChoices = departmentData.map(({ id, name }) => ({ name: name, value: id }));
        const response = await inquirer.prompt({
            type: 'list',
            message: "Which department would you like to delete?",
            name: "departmentId",
            choices: departmentChoices
        });

        // Delete the selected department
        const deleteQuery = `DELETE FROM department WHERE id = ${response.departmentId}`;
        await query(deleteQuery);

        console.log(`Successfully deleted department with ID ${response.departmentId}`);
    } catch (error) {
        console.log(error);
    }

    promptUser();
}

const promptUser = async () => {
    const { action } = await inquirer.prompt([
        {
            type: 'list',
            message: 'What would you like to do?',
            name: 'action',
            choices: ['View All Employees', 'Add Employee', 'Delete Employee', 'Update Employee Role', 'View All Roles', 'Add Role', 'Delete Role', 'View All Departments', 'Add Department', 'Delete Department', 'Quit']
        }
    ]);

    switch (action) {
        case 'View All Employees':
            viewEmployees();
            break;
        case 'Add Employee':
            addEmployee();
            break;
        case 'Delete Employee':
            deleteEmployee();
            break;
        case 'Update Employee Role':
            updateEmployeeRole();
            break;
        case 'View All Roles':
            viewRoles();
            break;
        case 'Add Role':
            addRole();
            break;
        case 'Delete Role':
            deleteRole();
            break;
        case 'View All Departments':
            viewDepartments();
            break;
        case 'Add Department':
            addDepartment();
            break;
        case 'Delete Department':
            deleteDepartment();
            break;
        case 'Quit':
            connection.end();
            return;
    }
};

promptUser();