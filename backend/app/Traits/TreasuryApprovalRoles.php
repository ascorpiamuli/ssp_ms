<?php

namespace App\Traits;

use App\Enums\UserRole;
use App\Models\User;
use App\Models\TreasuryCommittee;
use Illuminate\Support\Facades\Log;

trait TreasuryApprovalRoles
{
  /**
   * Check if user is Community Treasurer (Main Treasurer)
   * This comes from User model with role = TREASURER
   */
  protected function isCommunityTreasurer($userId): bool
  {
    $user = User::find($userId);
    return $user && $user->role === UserRole::TREASURER && $user->is_active;
  }

  /**
   * Check if user is Community Chairperson
   * This comes from User model with role = CHAIRPERSON
   */
  protected function isCommunityChairperson($userId): bool
  {
    $user = User::find($userId);
    return $user && $user->role === UserRole::CHAIRPERSON && $user->is_active;
  }

  /**
   * Check if user is Vice Chairperson
   */
  protected function isCommunityViceChairperson($userId): bool
  {
    $user = User::find($userId);
    return $user && $user->role === UserRole::VICE_CHAIRPERSON && $user->is_active;
  }

  /**
   * Check if user is Secretary
   */
  protected function isCommunitySecretary($userId): bool
  {
    $user = User::find($userId);
    return $user && $user->role === UserRole::SECRETARY && $user->is_active;
  }

  /**
   * Check if user is Treasury Committee Member (excluding main treasurer and chairperson)
   * These come from TreasuryCommittee model and help with verification
   */
  protected function isTreasuryCommitteeMember($userId): bool
  {
    return TreasuryCommittee::where('user_id', $userId)
      ->where('is_active', true)
      ->exists();
  }

  /**
   * Check if user is Treasury Committee Secretary
   */
  protected function isTreasuryCommitteeSecretary($userId): bool
  {
    return TreasuryCommittee::where('user_id', $userId)
      ->where('is_active', true)
      ->where('role', 'secretary')
      ->exists();
  }

  /**
   * Check if user is any authorized financial role (can record/view transactions)
   */
  protected function isFinancialRole($userId): bool
  {
    return $this->isCommunityTreasurer($userId) ||
      $this->isCommunityChairperson($userId) ||
      $this->isTreasuryCommitteeMember($userId);
  }

  /**
   * Check if user is authorized to verify income/expense
   * Rules:
   * - Treasury Committee Members (secretary/member) can verify
   * - Chairperson can verify
   * - The Treasurer who recorded the transaction CANNOT verify their own transaction
   */
  protected function canVerifyTransaction($userId, $recordedByUserId = null): bool
  {
    // CRITICAL RULE: Cannot verify own recorded transaction
    if ($recordedByUserId && $userId === $recordedByUserId) {
      return false;
    }

    // Chairperson can verify
    if ($this->isCommunityChairperson($userId)) {
      return true;
    }

    // Treasury Committee members (secretary/member) can verify
    return $this->isTreasuryCommitteeMember($userId);
  }

  /**
   * Check if user is authorized to confirm transaction (final approval)
   * Only Chairperson can confirm on behalf of members
   */
  protected function canConfirmTransaction($userId): bool
  {
    return $this->isCommunityChairperson($userId);
  }

  /**
   * Check if user is authorized to reject transaction
   * Can reject: recorder, Treasury Committee members, Chairperson
   */
  protected function canRejectTransaction($userId, $recordedByUserId = null): bool
  {
    return ($recordedByUserId && $userId === $recordedByUserId) ||
      $this->isCommunityChairperson($userId) ||
      $this->isTreasuryCommitteeMember($userId);
  }

  /**
   * Get all active Treasury Committee members (secretary and members only)
   * Excludes main treasurer and chairperson as they come from User model
   */
  protected function getTreasuryCommitteeMembers($excludeUserId = null): array
  {
    $query = TreasuryCommittee::with('user')
      ->where('is_active', true)
      ->whereIn('role', ['secretary', 'member']);

    if ($excludeUserId) {
      $query->where('user_id', '!=', $excludeUserId);
    }

    $members = $query->get();

    $users = [];
    foreach ($members as $member) {
      if ($member->user && $member->user->is_active) {
        $users[] = $member->user;
      }
    }

    return $users;
  }

  /**
   * Get all users who can verify transactions (excluding the recorder)
   * Returns Treasury Committee members + Chairperson
   */
  protected function getVerifiers($excludeUserId = null): array
  {
    $verifiers = [];

    // Add Treasury Committee members
    $committeeMembers = $this->getTreasuryCommitteeMembers($excludeUserId);
    $verifiers = array_merge($verifiers, $committeeMembers);

    // Add Chairperson
    $chairperson = $this->getCommunityChairperson();
    if ($chairperson && (!$excludeUserId || $chairperson->id !== $excludeUserId)) {
      $verifiers[] = $chairperson;
    }

    return $verifiers;
  }

  /**
   * Get the Community Treasurer (Main Treasurer from User model)
   */
  protected function getCommunityTreasurer(): ?User
  {
    return User::where('role', UserRole::TREASURER)
      ->where('is_active', true)
      ->first();
  }

  /**
   * Get the Community Chairperson (from User model)
   */
  protected function getCommunityChairperson(): ?User
  {
    return User::where('role', UserRole::CHAIRPERSON)
      ->where('is_active', true)
      ->first();
  }

  /**
   * Get the Community Vice Chairperson (from User model)
   */
  protected function getCommunityViceChairperson(): ?User
  {
    return User::where('role', UserRole::VICE_CHAIRPERSON)
      ->where('is_active', true)
      ->first();
  }

  /**
   * Get the Community Secretary (from User model)
   */
  protected function getCommunitySecretary(): ?User
  {
    return User::where('role', UserRole::SECRETARY)
      ->where('is_active', true)
      ->first();
  }

  /**
   * Get all main officers (Treasurer, Chairperson, Vice Chairperson, Secretary)
   */
  protected function getMainOfficers(): array
  {
    $officers = [];

    $treasurer = $this->getCommunityTreasurer();
    if ($treasurer) {
      $officers[] = $treasurer;
    }

    $chairperson = $this->getCommunityChairperson();
    if ($chairperson) {
      $officers[] = $chairperson;
    }

    $viceChairperson = $this->getCommunityViceChairperson();
    if ($viceChairperson) {
      $officers[] = $viceChairperson;
    }

    $secretary = $this->getCommunitySecretary();
    if ($secretary) {
      $officers[] = $secretary;
    }

    return $officers;
  }

  /**
   * Get complete treasury team (main officers + committee members)
   */
  protected function getCompleteTreasuryTeam($excludeUserId = null): array
  {
    $team = [];

    // Add main officers
    $mainOfficers = $this->getMainOfficers();
    foreach ($mainOfficers as $officer) {
      if (!$excludeUserId || $officer->id !== $excludeUserId) {
        $team[] = $officer;
      }
    }

    // Add committee members
    $committeeMembers = $this->getTreasuryCommitteeMembers($excludeUserId);
    $team = array_merge($team, $committeeMembers);

    return $team;
  }

  /**
   * Get committee member role label
   */
  protected function getCommitteeMemberRoleLabel($userId): string
  {
    $member = TreasuryCommittee::where('user_id', $userId)
      ->where('is_active', true)
      ->first();

    if (!$member) {
      return 'Committee Member';
    }

    return $member->role_label ?? ucfirst($member->role);
  }

  /**
   * Check if a transaction requires chairperson confirmation (external income/department)
   */
  protected function requiresChairpersonConfirmation($sourceType): bool
  {
    return in_array($sourceType, ['external', 'department']);
  }

  /**
   * Log authorization failure
   */
  protected function logAuthFailure($action, $userId, $role, $additionalInfo = []): void
  {
    Log::warning('[TreasuryAuth] Authorization failed', array_merge([
      'action' => $action,
      'user_id' => $userId,
      'user_role' => $role,
      'timestamp' => now()->toDateTimeString(),
    ], $additionalInfo));
  }
}
