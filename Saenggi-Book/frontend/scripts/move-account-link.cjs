const fs = require('fs');

let content = fs.readFileSync('src/components/service-cards-page.tsx', 'utf8');

// Remove account-link from currentServices
const accountLinkInCurrent = `  {
    id: "account-link",
    title: "계정 연동",
    price: "무료",
    description: "조회하고 싶은 사람들 여기 다 부르자!",
    icon: <Users className="w-6 h-6" />,
    href: "/users/profile",
    color: "text-emerald-600",
    bgGradient: "from-emerald-500 to-emerald-600",
    features: [
      "학부모와 연동",
      "선생님과 연동"
    ],
  },
];`;

const currentServicesEnd = `  },
];`;

content = content.replace(accountLinkInCurrent, currentServicesEnd);

// Add account-link to end of winterServices (with disabled: true)
const winterServicesEnd = `    disabled: true,
  },
];

// 3월 신학기부터 서비스`;

const accountLinkInWinter = `    disabled: true,
  },
  {
    id: "account-link",
    title: "계정 연동",
    price: "무료",
    description: "조회하고 싶은 사람들 여기 다 부르자!",
    icon: <Users className="w-6 h-6" />,
    href: "/users/profile",
    color: "text-emerald-600",
    bgGradient: "from-emerald-500 to-emerald-600",
    features: [
      "학부모와 연동",
      "선생님과 연동"
    ],
    disabled: true,
  },
];

// 3월 신학기부터 서비스`;

content = content.replace(winterServicesEnd, accountLinkInWinter);

fs.writeFileSync('src/components/service-cards-page.tsx', content, 'utf8');
console.log('Moved account-link card to winterServices (end)!');
