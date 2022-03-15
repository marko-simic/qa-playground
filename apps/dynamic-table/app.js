let tableBody = document.querySelector("#tbody");

fetch("./database/db1.json")
  .then((res) => res.json())
  .then((json) => {
    getShuffledArr(json).map((data) => {
      console.log(data);
      tableBody.append(createTableData(data));
    });
  });

function createTableData({ name, email, profile, real_name }) {
  let td = document.createElement("tr");
  td.innerHTML = `
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="flex items-center">
            <div class="flex-shrink-0 h-10 w-10">
              <img src="./img/${profile}" class="h-10 w-10 rounded-full" alt="" />
            </div>
            <div class="ml-4">
              <div class="text-sm font-medium text-white-900">${name}</div>
              <div class="text-sm text-gray-500">${email}</div>
            </div>
          </div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <span
            class="px-2 inline-flex text-xs text-xs leading-5 font-semibold rounded-full bg-green-400 text-green-800"
            >Active</span
          >
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <span class="text-sm font-medium text-white-900">${real_name}</span>
        </td>
        `;
  return td;
}

const getShuffledArr = (arr) => {
  const newArr = arr.slice();
  for (let i = newArr.length - 1; i > 0; i--) {
    const rand = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[rand]] = [newArr[rand], newArr[i]];
  }
  return newArr;
};
