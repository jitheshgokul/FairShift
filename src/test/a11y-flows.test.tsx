import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Header } from '../components/Header';
import { WorkerAttendanceCard } from '../components/worker/WorkerAttendanceCard';
import { WorkerTicketLookup } from '../components/worker/WorkerTicketLookup';
import { INITIAL_WORKERS } from '../services/storageService';

describe('Accessibility & UI Navigation Verification', () => {
  const dummyWorker = INITIAL_WORKERS[0];

  it('renders Header with accessible landmarks, labels, and aria-pressed attributes', () => {
    render(
      <Header
        currentRole="worker"
        isUserAdmin={false}
        currentIndustry="construction"
        onIndustryChange={() => {}}
        currentLanguage="en"
        onLanguageChange={() => {}}
        currentWorker={dummyWorker}
        availableWorkers={INITIAL_WORKERS}
        onWorkerChange={() => {}}
        onResetDemo={() => {}}
        authUser={null}
        onSignInGoogle={() => {}}
        onSignOut={() => {}}
      />
    );

    // Check accessible brand button
    const brandBtn = screen.getByRole('button', { name: /fairshift home, return to welcome screen/i });
    expect(brandBtn).toBeDefined();

    // Check industry switcher navigation landmark
    const industryNav = screen.getByRole('navigation', { name: /industry sector selection/i });
    expect(industryNav).toBeDefined();

    // Check aria-pressed on active industry
    const constructionBtn = screen.getByRole('button', { name: /construction/i });
    expect(constructionBtn.getAttribute('aria-pressed')).toBe('true');

    // Check language selector accessible label
    const langSelect = screen.getByLabelText(/language/i);
    expect(langSelect).toBeDefined();
  });

  it('renders WorkerAttendanceCard with accessible form label linked to site select', () => {
    render(
      <WorkerAttendanceCard
        worker={dummyWorker}
        language="en"
        onCheckIn={() => {}}
        onCheckOut={() => {}}
        onToggleBreak={() => {}}
      />
    );

    // Label should be properly associated to input select
    const siteSelect = screen.getByLabelText(/work location/i);
    expect(siteSelect).toBeDefined();
    expect(siteSelect.getAttribute('id')).toBe('site-location-select');

    // Check In button should have clear accessible name
    const checkInBtn = screen.getByRole('button', { name: /check in/i });
    expect(checkInBtn).toBeDefined();
  });

  it('renders WorkerTicketLookup with labeled input and accessible search button', () => {
    render(<WorkerTicketLookup language="en" />);

    // Labeled search input
    const input = screen.getByLabelText(/enter tracking id/i);
    expect(input).toBeDefined();
    expect(input.getAttribute('id')).toBe('ticket-id-search');

    // Labeled search button
    const submitBtn = screen.getByRole('button', { name: /check status/i });
    expect(submitBtn).toBeDefined();
  });
});
